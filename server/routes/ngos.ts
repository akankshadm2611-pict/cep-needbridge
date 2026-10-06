/**
 * server/routes/ngos.ts — NGO profile CRUD + verification document upload.
 */
import { Router, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import {
  NgoProfilesRepo,
  UsersRepo,
  RequirementsRepo,
  ApplicationsRepo,
  VolunteerProfilesRepo,
} from '../db/repositories/index.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import type { SDGNumber } from '../../shared/types.js';

const router = Router();

// ─── Get my NGO profile ───────────────────────────────────────────────────────

router.get('/me', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const profile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'NGO profile not found.' });
      return;
    }
    res.json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
});

router.get('/me/requirements', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const profile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'NGO profile not found.' });
      return;
    }
    const items = RequirementsRepo.findAll()
      .filter((r) => r.ngoId === profile.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ ok: true, data: items });
  } catch (err) {
    next(err);
  }
});

router.get('/me/applications', requireAuth, requireRole('ngo'), async (req: AuthRequest, res, next) => {
  try {
    const profile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'NGO profile not found.' });
      return;
    }
    const reqIds = new Set(RequirementsRepo.findAll().filter((r) => r.ngoId === profile.id).map((r) => r.id));
    const apps = ApplicationsRepo.findAll()
      .filter((a) => reqIds.has(a.requirementId))
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
      .map((app) => {
        const requirement = RequirementsRepo.findById(app.requirementId);
        const volProfile = VolunteerProfilesRepo.findById(app.volunteerId);
        const volUser = volProfile ? UsersRepo.findById(volProfile.userId) : null;
        return {
          ...app,
          _requirement: requirement ?? null,
          _volunteerProfile: volProfile ? {
            name: volProfile.name,
            phone: volProfile.phone,
            email: volUser?.email,
            location: volProfile.location,
            skills: volProfile.skills,
            contributionType: volProfile.contributionType,
            availability: volProfile.availability,
            bio: volProfile.bio,
            reliabilityScore: volProfile.reliabilityScore,
            interests: volProfile.interests,
            resourceCategories: volProfile.resourceCategories,
          } : null,
        };
      });
    res.json({ ok: true, data: apps });
  } catch (err) {
    next(err);
  }
});

// ─── List NGOs (public) ───────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const { verified, verifiedOnly, city, page = '1', limit = '20' } = req.query as Record<string, string>;
  let items = NgoProfilesRepo.findAll();

  if (verified === 'true' || verifiedOnly === 'true') {
    items = items.filter((n) => n.verificationStatus === 'verified');
  }
  if (city) items = items.filter(n => n.location.city.toLowerCase().includes(city.toLowerCase()));

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum);
  const paged = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ ok: true, data: { items: paged, total, page: pageNum, limit: limitNum, totalPages } });
});

// ─── Get single NGO ───────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  const profile = NgoProfilesRepo.findById(req.params.id);
  if (!profile) {
    res.status(404).json({ ok: false, error: 'NGO not found.' });
    return;
  }
  res.json({ ok: true, data: profile });
});

// ─── Update NGO profile ───────────────────────────────────────────────────────

const UpdateNgoSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(2000).optional(),
  organizationType: z.string().optional(),
  registrationNumber: z.string().optional(),
  causeAreas: z.array(z.string()).optional(),
  sdgTags: z.array(z.number().int().min(1).max(17)).optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

async function updateMyNgo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!profile) {
      res.status(404).json({ ok: false, error: 'NGO profile not found.' });
      return;
    }

    const body = req.body as z.infer<typeof UpdateNgoSchema>;
    const updated = await NgoProfilesRepo.update(profile.id, {
      ...body,
      sdgTags: body.sdgTags as SDGNumber[] | undefined,
    });

    if (updated && updated.name && updated.location?.city) {
      await UsersRepo.update(req.userId!, { onboardingComplete: true });
    }

    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
}

router.put('/me', requireAuth, requireRole('ngo'), validate(UpdateNgoSchema), updateMyNgo);
router.patch('/me', requireAuth, requireRole('ngo'), validate(UpdateNgoSchema), updateMyNgo);

// ─── Upload verification documents ────────────────────────────────────────────

router.post(
  '/me/documents',
  requireAuth,
  requireRole('ngo'),
  upload.array('documents', 5),
  async (req: AuthRequest, res, next) => {
    try {
      const profile = NgoProfilesRepo.findByUserId(req.userId!);
      if (!profile) {
        res.status(404).json({ ok: false, error: 'NGO profile not found.' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ ok: false, error: 'No documents uploaded.' });
        return;
      }

      const newDocs = files.map(f => ({
        id: path.basename(f.filename, path.extname(f.filename)),
        filename: f.filename,
        originalName: f.originalname,
        uploadedAt: new Date().toISOString(),
        mimeType: f.mimetype,
      }));

      const updatedDocs = [...profile.verificationDocuments, ...newDocs];
      const updated = await NgoProfilesRepo.update(profile.id, {
        verificationDocuments: updatedDocs,
        verificationStatus: 'pending', // re-submit for review
      });

      res.json({ ok: true, data: { documents: updatedDocs, profile: updated } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
