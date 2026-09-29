/**
 * server/routes/admin.ts — Admin-only routes for user management, NGO verification, and impact reports.
 */
import { Router } from 'express';
import { z } from 'zod';
import {
  UsersRepo,
  NgoProfilesRepo,
  VolunteerProfilesRepo,
  RequirementsRepo,
  ApplicationsRepo,
  NotificationsRepo,
} from '../db/repositories/index.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { notifyVerificationUpdate } from '../services/notify.js';
import type { ImpactStats, SDGNumber } from '../../shared/types.js';

const router = Router();

// All admin routes require admin role
router.use(requireAuth, requireRole('admin'));

// ─── List all users ───────────────────────────────────────────────────────────

router.get('/users', async (req, res, next) => {
  try {
    const { role, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const result = UsersRepo.find(
      {
        ...(role ? { role: role as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      { page: pageNum, limit: limitNum, sort: { field: 'createdAt', dir: 'desc' } }
    );

    const items = result.items.map(u => UsersRepo.toPublic(u));
    res.json({ ok: true, data: { ...result, items } });
  } catch (err) {
    next(err);
  }
});

// ─── Suspend / reactivate user ────────────────────────────────────────────────

router.put('/users/:id/status', validate(z.object({ status: z.enum(['active', 'suspended']) })), async (req, res, next) => {
  try {
    const user = UsersRepo.findById(req.params.id);
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found.' });
      return;
    }
    const updated = await UsersRepo.update(req.params.id, { status: req.body.status });
    res.json({ ok: true, data: UsersRepo.toPublic(updated!) });
  } catch (err) {
    next(err);
  }
});

// ─── List pending NGO verifications ──────────────────────────────────────────

router.get('/verifications', async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query as Record<string, string>;
    const ngos = NgoProfilesRepo.find({ verificationStatus: status as any });
    res.json({ ok: true, data: ngos });
  } catch (err) {
    next(err);
  }
});

// ─── Approve / reject NGO verification ───────────────────────────────────────

const VerifySchema = z.object({
  decision: z.enum(['verified', 'rejected']),
  note: z.string().max(500).optional(),
});

router.put('/verifications/:ngoId', validate(VerifySchema), async (req, res, next) => {
  try {
    const ngo = NgoProfilesRepo.findById(req.params.ngoId);
    if (!ngo) {
      res.status(404).json({ ok: false, error: 'NGO not found.' });
      return;
    }

    const { decision, note } = req.body as z.infer<typeof VerifySchema>;
    const updated = await NgoProfilesRepo.update(ngo.id, {
      verificationStatus: decision,
      verificationNote: note,
    });

    await notifyVerificationUpdate(ngo.userId, decision, note);

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Impact / SDG report ──────────────────────────────────────────────────────

router.get('/impact', async (req, res, next) => {
  try {
    const allUsers = UsersRepo.findAll();
    const allNgos = NgoProfilesRepo.findAll();
    const allReqs = RequirementsRepo.findAll();
    const allApps = ApplicationsRepo.findAll();

    const sdgBreakdown: Partial<Record<SDGNumber, number>> = {};
    for (const req of allReqs) {
      if (req.status === 'completed') {
        for (const sdg of req.sdgTags) {
          sdgBreakdown[sdg] = (sdgBreakdown[sdg] ?? 0) + req.peopleHelped;
        }
      }
    }

    const stats: ImpactStats = {
      ngosCount: allNgos.length,
      verifiedNgosCount: allNgos.filter(n => n.verificationStatus === 'verified').length,
      volunteersCount: allUsers.filter(u => u.role === 'volunteer').length,
      requirementsCount: allReqs.length,
      openRequirementsCount: allReqs.filter(r => r.status === 'open').length,
      applicationsCount: allApps.length,
      acceptedApplicationsCount: allApps.filter(a => a.status === 'accepted').length,
      fulfillmentRate:
        allApps.length > 0
          ? Math.round((allApps.filter(a => a.fulfilled).length / allApps.length) * 100)
          : 0,
      totalPeopleHelped: allReqs
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.peopleHelped, 0),
      sdgBreakdown,
    };

    res.json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// ─── List all requirements (admin oversight) ──────────────────────────────────

router.get('/requirements', async (req, res, next) => {
  try {
    const { status, ngoId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (ngoId) filter.ngoId = ngoId;

    const result = RequirementsRepo.find(filter as any, { page: parseInt(page), limit: parseInt(limit) });
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
