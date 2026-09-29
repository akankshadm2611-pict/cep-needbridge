/**
 * server/routes/volunteers.ts — Volunteer profile CRUD + matched recommendations.
 */
import { Router } from 'express';
import { z } from 'zod';
import { VolunteerProfilesRepo, RequirementsRepo, UsersRepo, ApplicationsRepo } from '../db/repositories/index.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getMatchedRequirements } from '../services/matching.js';
import type { SDGNumber, ContributionType } from '../../shared/types.js';

const router = Router();

// ─── Get my profile ───────────────────────────────────────────────────────────

router.get('/me', requireAuth, requireRole('volunteer'), async (req: AuthRequest, res, next) => {
  try {
    const profile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'Volunteer profile not found.' });
      return;
    }
    res.json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// ─── Update my profile ────────────────────────────────────────────────────────

const UpdateVolunteerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  contributionType: z.enum(['time', 'goods', 'both']).optional(),
  skills: z.array(z.string()).optional(),
  resourceCategories: z.array(z.string()).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  interests: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  sdgInterests: z.array(z.number().int().min(1).max(17)).optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  remoteOk: z.boolean().optional(),
  availability: z.object({
    days: z.array(z.string()),
    hoursPerWeek: z.number().optional(),
    timePreference: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  }).optional(),
});

async function updateMyVolunteer(req: AuthRequest, res: any, next: any) {
  try {
    const profile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'Volunteer profile not found.' });
      return;
    }

    const body = req.body as z.infer<typeof UpdateVolunteerSchema>;
    const updated = await VolunteerProfilesRepo.update(profile.id, {
      ...body,
      sdgInterests: body.sdgInterests as SDGNumber[] | undefined,
      contributionType: body.contributionType as ContributionType | undefined,
    });

    // Mark onboarding complete if profile has essentials
    if (updated) {
      await UsersRepo.update(req.userId!, { onboardingComplete: true });
    }

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
}

router.put('/me', requireAuth, requireRole('volunteer'), validate(UpdateVolunteerSchema), updateMyVolunteer);
router.patch('/me', requireAuth, requireRole('volunteer'), validate(UpdateVolunteerSchema), updateMyVolunteer);

// ─── Get matched requirements for current volunteer ────────────────────────────

router.get('/me/matches', requireAuth, requireRole('volunteer'), async (req: AuthRequest, res, next) => {
  try {
    const profile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(200).json({ ok: true, data: [] });
      return;
    }

    const allOpen = RequirementsRepo.findAll().filter(r => r.status === 'open');
    const topN = parseInt(req.query.limit as string ?? '20', 10);
    const matched = getMatchedRequirements(profile, allOpen, topN);

    res.json({ ok: true, data: matched });
  } catch (err) {
    next(err);
  }
});

// ─── Get my applications for current volunteer ────────────────────────────

router.get('/me/applications', requireAuth, requireRole('volunteer'), async (req: AuthRequest, res, next) => {
  try {
    const profile = VolunteerProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.json({ ok: true, data: [] });
      return;
    }
    const apps = ApplicationsRepo.findByVolunteerId(profile.id);
    apps.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

    // Attach requirement details
    const enriched = apps.map(app => {
      const requirement = RequirementsRepo.findById(app.requirementId);
      return { ...app, _requirement: requirement ?? null };
    });

    res.json({ ok: true, data: enriched });
  } catch (err) {
    next(err);
  }
});

export default router;
