/**
 * server/routes/applications.ts — Apply/pledge, accept/reject, withdraw.
 * Implements the bounded quantity allocation algorithm.
 */
import { Router } from 'express';
import { z } from 'zod';
import {
  ApplicationsRepo,
  RequirementsRepo,
  VolunteerProfilesRepo,
  NgoProfilesRepo,
} from '../db/repositories/index.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { boundedAllocate, scoreRequirementForVolunteer } from '../services/matching.js';
import {
  notifyApplicationDecision,
  notifyPledgeAccepted,
  notifyNewApplication,
  notifyPledgeFulfilled,
} from '../services/notify.js';

const router = Router();

// ─── Apply / Pledge ───────────────────────────────────────────────────────────

const ApplySchema = z.object({
  requirementId: z.string().min(1),
  message: z.string().max(1000).optional(),
  kind: z.enum(['time', 'goods']),
  pledgedQuantity: z.number().positive().optional(),
});

router.post('/', requireAuth, requireRole('volunteer'), validate(ApplySchema), async (req: AuthRequest, res, next) => {
  try {
    const { requirementId, message, kind, pledgedQuantity } = req.body as z.infer<typeof ApplySchema>;

    const requirement = RequirementsRepo.findById(requirementId);
    if (!requirement) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    if (requirement.status !== 'open') {
      res.status(400).json({ ok: false, error: 'This requirement is no longer accepting applications.' });
      return;
    }

    const volProfile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!volProfile) {
      res.status(400).json({ ok: false, error: 'Volunteer profile not found. Please complete your profile.' });
      return;
    }

    // Check kind compatibility
    if (kind === 'goods' && requirement.type === 'time') {
      res.status(400).json({ ok: false, error: 'This requirement only accepts time volunteering, not goods.' });
      return;
    }
    if (kind === 'time' && requirement.type === 'goods') {
      res.status(400).json({ ok: false, error: 'This requirement only accepts goods donations, not time.' });
      return;
    }

    // Goods: validate and bound quantity
    let allocatedQuantity: number | undefined;
    if (kind === 'goods') {
      if (!pledgedQuantity || pledgedQuantity <= 0) {
        res.status(400).json({ ok: false, error: 'Please specify the quantity you wish to donate.' });
        return;
      }
      if (!requirement.resourceNeeded) {
        res.status(400).json({ ok: false, error: 'This requirement has no goods specification.' });
        return;
      }

      // Check if goods are still needed
      const remaining = requirement.resourceNeeded.quantityNeeded - requirement.resourceNeeded.quantityPledged;
      if (remaining <= 0) {
        res.status(400).json({ ok: false, error: 'This requirement has already received sufficient donations. Thank you!' });
        return;
      }

      // Bounded allocation: prevent surplus
      allocatedQuantity = boundedAllocate(pledgedQuantity, requirementId);
    }

    // Time: check spots available
    if (kind === 'time') {
      if (requirement.volunteersAccepted >= requirement.volunteersNeeded) {
        res.status(400).json({ ok: false, error: 'All volunteer spots are filled for this requirement.' });
        return;
      }
    }

    // Compute match score
    const matchScore = scoreRequirementForVolunteer(requirement, volProfile);

    const application = await ApplicationsRepo.create({
      requirementId,
      volunteerId: volProfile.id,
      volunteerName: volProfile.name,
      message,
      kind,
      pledgedQuantity,
      allocatedQuantity,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      fulfilled: false,
      matchScore: matchScore?.totalScore,
    });

    // Notify NGO
    const ngoProfile = NgoProfilesRepo.findById(requirement.ngoId);
    if (ngoProfile) {
      const ngoUser = (await import('../db/repositories/index.js')).UsersRepo.findById(ngoProfile.userId);
      if (ngoUser) {
        await notifyNewApplication(ngoUser.id, volProfile.name, requirement.title, requirementId);
      }
    }

    res.status(201).json({ ok: true, data: application });
  } catch (err) {
    if (err instanceof Error && err.message.includes('already applied')) {
      res.status(409).json({ ok: false, error: 'You have already applied to this requirement.' });
    } else {
      next(err);
    }
  }
});

// ─── List my applications (volunteer) ────────────────────────────────────────

router.get('/my', requireAuth, requireRole('volunteer'), async (req: AuthRequest, res, next) => {
  try {
    const volProfile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!volProfile) {
      res.json({ ok: true, data: [] });
      return;
    }
    const apps = ApplicationsRepo.findByVolunteerId(volProfile.id);
    apps.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

    // Attach requirement details
    const enriched = apps.map(app => {
      const req = RequirementsRepo.findById(app.requirementId);
      return { ...app, _requirement: req ?? null };
    });

    res.json({ ok: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

// ─── Accept application (NGO) ────────────────────────────────────────────────

router.put('/:id/accept', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const application = ApplicationsRepo.findById(req.params.id);
    if (!application) {
      res.status(404).json({ ok: false, error: 'Application not found.' });
      return;
    }

    const requirement = RequirementsRepo.findById(application.requirementId);
    if (!requirement) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    // Ownership check
    const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!ngoProfile || requirement.ngoId !== ngoProfile.id) {
      res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ ok: false, error: `Application is already ${application.status}.` });
      return;
    }

    // For time volunteers: check spots
    if (application.kind === 'time' && requirement.volunteersAccepted >= requirement.volunteersNeeded) {
      res.status(400).json({ ok: false, error: 'All volunteer spots are already filled.' });
      return;
    }

    const decidedAt = new Date().toISOString();
    const updated = await ApplicationsRepo.update(req.params.id, {
      status: 'accepted',
      decidedAt,
    });

    // Update requirement counts
    if (application.kind === 'time') {
      await RequirementsRepo.update(requirement.id, {
        volunteersAccepted: requirement.volunteersAccepted + 1,
        status:
          requirement.volunteersAccepted + 1 >= requirement.volunteersNeeded
            ? 'in_progress'
            : 'open',
      });
    } else if (application.kind === 'goods' && application.allocatedQuantity) {
      const newPledged = (requirement.resourceNeeded?.quantityPledged ?? 0) + application.allocatedQuantity;
      const newStatus =
        newPledged >= (requirement.resourceNeeded?.quantityNeeded ?? 0) ? 'in_progress' : 'open';
      await RequirementsRepo.update(requirement.id, {
        resourceNeeded: requirement.resourceNeeded
          ? { ...requirement.resourceNeeded, quantityPledged: newPledged }
          : undefined,
        status: newStatus,
      });
    }

    // Notify volunteer
    const volProfile = (await import('../db/repositories/index.js')).VolunteerProfilesRepo.findById(application.volunteerId);
    if (volProfile) {
      const volUser = (await import('../db/repositories/index.js')).UsersRepo.findById(volProfile.userId);
      if (volUser) {
        if (application.kind === 'goods' && application.allocatedQuantity && requirement.resourceNeeded) {
          await notifyPledgeAccepted(
            volUser.id,
            requirement.title,
            requirement.id,
            application.allocatedQuantity,
            requirement.resourceNeeded.unit
          );
        } else {
          await notifyApplicationDecision(volUser.id, requirement.title, requirement.id, true);
        }
      }
    }

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Reject application (NGO) ────────────────────────────────────────────────

router.put('/:id/reject', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const application = ApplicationsRepo.findById(req.params.id);
    if (!application) {
      res.status(404).json({ ok: false, error: 'Application not found.' });
      return;
    }

    const requirement = RequirementsRepo.findById(application.requirementId);
    if (!requirement) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!ngoProfile || requirement.ngoId !== ngoProfile.id) {
      res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ ok: false, error: `Application is already ${application.status}.` });
      return;
    }

    const updated = await ApplicationsRepo.update(req.params.id, {
      status: 'rejected',
      decidedAt: new Date().toISOString(),
    });

    // Notify volunteer
    const volProfile = VolunteerProfilesRepo.findById(application.volunteerId);
    if (volProfile) {
      const { UsersRepo } = await import('../db/repositories/index.js');
      const volUser = UsersRepo.findById(volProfile.userId);
      if (volUser) {
        await notifyApplicationDecision(volUser.id, requirement.title, requirement.id, false);
      }
    }

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Withdraw application (volunteer) ────────────────────────────────────────

router.put('/:id/withdraw', requireAuth, requireRole('volunteer'), async (req: AuthRequest, res, next) => {
  try {
    const application = ApplicationsRepo.findById(req.params.id);
    if (!application) {
      res.status(404).json({ ok: false, error: 'Application not found.' });
      return;
    }

    const volProfile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!volProfile || application.volunteerId !== volProfile.id) {
      res.status(403).json({ ok: false, error: 'You do not own this application.' });
      return;
    }

    if (!['pending', 'accepted'].includes(application.status)) {
      res.status(400).json({ ok: false, error: 'This application cannot be withdrawn.' });
      return;
    }

    // If accepted goods pledge, release the quantity
    if (application.status === 'accepted' && application.kind === 'goods' && application.allocatedQuantity) {
      const requirement = RequirementsRepo.findById(application.requirementId);
      if (requirement?.resourceNeeded) {
        await RequirementsRepo.update(requirement.id, {
          resourceNeeded: {
            ...requirement.resourceNeeded,
            quantityPledged: Math.max(0, requirement.resourceNeeded.quantityPledged - application.allocatedQuantity),
          },
          status: 'open',
        });
      }
    }

    const updated = await ApplicationsRepo.update(req.params.id, { status: 'withdrawn' });
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Mark fulfilled (NGO confirms delivery & uploads proof photo) ────────────

const FulfillSchema = z.object({
  hoursLogged: z.number().nonnegative().optional(),
  proofImageUrl: z.string().url().or(z.string().startsWith('data:image/')).optional(),
  proofNote: z.string().max(1000).optional(),
});

router.put('/:id/fulfill', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const parsed = FulfillSchema.safeParse(req.body);
    const { hoursLogged, proofImageUrl, proofNote } = parsed.success ? parsed.data : req.body || {};

    const application = ApplicationsRepo.findById(req.params.id);
    if (!application) {
      res.status(404).json({ ok: false, error: 'Application not found.' });
      return;
    }

    if (application.status !== 'accepted') {
      res.status(400).json({ ok: false, error: 'Only accepted applications can be marked as fulfilled.' });
      return;
    }

    const requirement = RequirementsRepo.findById(application.requirementId);
    const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!ngoProfile || requirement?.ngoId !== ngoProfile.id) {
      res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
      return;
    }

    // If already fulfilled, only allow updating the proof image/note (not re-running completion logic)
    if (application.fulfilled) {
      if (!proofImageUrl) {
        res.status(400).json({ ok: false, error: 'Please upload a proof photo to update.' });
        return;
      }
      const updated = await ApplicationsRepo.update(req.params.id, {
        proofImageUrl,
        proofNote: proofNote || application.proofNote,
      });
      // Always update requirement's imageUrl so donors can see it
      if (requirement) {
        await RequirementsRepo.update(requirement.id, { imageUrl: proofImageUrl });
      }
      res.json({ ok: true, data: updated });
      return;
    }

    const updated = await ApplicationsRepo.update(req.params.id, {
      fulfilled: true,
      hoursLogged: hoursLogged ?? application.hoursLogged,
      proofImageUrl: proofImageUrl || application.proofImageUrl,
      proofNote: proofNote || application.proofNote,
    });

    // If photo proof is provided, always update the requirement's imageUrl so donors can see it
    if (proofImageUrl && requirement) {
      await RequirementsRepo.update(requirement.id, {
        imageUrl: proofImageUrl,
      });
    }

    // Check if target capacity is fully met AND all accepted applications are fulfilled
    const allApps = ApplicationsRepo.findByRequirementId(application.requirementId);
    const allAccepted = allApps.filter((a) => a.status === 'accepted');
    const allFulfilled = allAccepted.every((a) => a.fulfilled || a.id === req.params.id);

    if (requirement) {
      let isGoalFullyMet = true;
      if (requirement.type !== 'time' && requirement.resourceNeeded) {
        if (requirement.resourceNeeded.quantityPledged < requirement.resourceNeeded.quantityNeeded) {
          isGoalFullyMet = false;
        }
      }
      if (requirement.type !== 'goods' && requirement.volunteersNeeded > 0) {
        if (requirement.volunteersAccepted < requirement.volunteersNeeded) {
          isGoalFullyMet = false;
        }
      }

      // Only transition to 'completed' if the target need is completely reached AND all accepted pledges are fulfilled
      if (isGoalFullyMet && allFulfilled && allAccepted.length > 0) {
        await RequirementsRepo.update(application.requirementId, { status: 'completed' });
      } else {
        // Keep requirement open so remaining needs can be fulfilled by other donors
        await RequirementsRepo.update(application.requirementId, { status: 'open' });
      }
    }

    // Notify donor/volunteer with confirmation & proof
    const volProfile = VolunteerProfilesRepo.findById(application.volunteerId);
    if (volProfile && requirement) {
      const { UsersRepo } = await import('../db/repositories/index.js');
      const volUser = UsersRepo.findById(volProfile.userId);
      if (volUser) {
        await notifyPledgeFulfilled(
          volUser.id,
          requirement.title,
          requirement.id,
          ngoProfile.name,
          !!proofImageUrl
        );
      }
    }

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
