/**
 * server/routes/requirements.ts — CRUD for requirements (volunteer time + goods donations).
 */
import { Router } from 'express';
import { z } from 'zod';
import {
  RequirementsRepo,
  NgoProfilesRepo,
  ApplicationsRepo,
} from '../db/repositories/index.js';
import { requireAuth, requireRole, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import type { RequirementStatus, UrgencyLevel, ContributionType, SDGNumber } from '../../shared/types.js';

const router = Router();

// ─── List Requirements (public, with filters) ─────────────────────────────────

router.get('/', optionalAuth, (req: AuthRequest, res) => {
  const {
    status,
    type,
    category,
    city,
    urgency,
    ngoId,
    page = '1',
    limit = '20',
  } = req.query as Record<string, string>;

  let items = RequirementsRepo.findAll();

  // Default to open status for public listing
  if (!req.userId || req.userRole === 'volunteer') {
    items = items.filter(r => r.status === 'open');
  }

  if (status) items = items.filter(r => r.status === (status as RequirementStatus));
  if (type) items = items.filter(r => r.type === (type as ContributionType));
  if (category) items = items.filter(r => r.category.toLowerCase() === category.toLowerCase());
  if (city) items = items.filter(r => r.location.city.toLowerCase().includes(city.toLowerCase()));
  if (urgency) items = items.filter(r => r.urgency === (urgency as UrgencyLevel));
  if (ngoId) items = items.filter(r => r.ngoId === ngoId);

  // Sort by urgency first, then createdAt
  const urgencyOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
  items.sort((a, b) => {
    const uDiff = (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
    if (uDiff !== 0) return uDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum);
  const paged = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ ok: true, data: { items: paged, total, page: pageNum, limit: limitNum, totalPages } });
});

// ─── Get single requirement ───────────────────────────────────────────────────

router.get('/:id', optionalAuth, (req, res) => {
  const req2 = RequirementsRepo.findById(req.params.id);
  if (!req2) {
    res.status(404).json({ ok: false, error: 'Requirement not found.' });
    return;
  }

  // Attach current pledge/volunteer counts
  const pledgedQty = RequirementsRepo.sumPledgedQuantity(req2.id);
  const acceptedCount = RequirementsRepo.countAccepted(req2.id);

  res.json({
    ok: true,
    data: {
      ...req2,
      _pledgedQty: pledgedQty,
      _acceptedCount: acceptedCount,
    },
  });
});

// ─── Create Requirement (NGO only) ────────────────────────────────────────────

const GeoLocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const ResourceSpecSchema = z.object({
  itemName: z.string().min(1),
  unit: z.string().min(1),
  quantityNeeded: z.number().positive(),
  quantityPledged: z.number().min(0).default(0),
});

const CreateRequirementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.string().min(1),
  type: z.enum(['time', 'goods', 'both']),
  skillsRequired: z.array(z.string()).default([]),
  resourceNeeded: ResourceSpecSchema.optional(),
  volunteersNeeded: z.number().int().min(0).default(0),
  location: GeoLocationSchema,
  isRemote: z.boolean().default(false),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  deadline: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  status: z.enum(['draft', 'open']).default('open'),
  sdgTags: z.array(z.number().int().min(1).max(17)).default([]),
  peopleHelped: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
});

router.post('/', requireAuth, requireRole('ngo'), validate(CreateRequirementSchema), async (req: AuthRequest, res, next) => {
  try {
    const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!ngoProfile) {
      res.status(400).json({ ok: false, error: 'NGO profile not found.' });
      return;
    }

    if (ngoProfile.verificationStatus !== 'verified') {
      res.status(403).json({
        ok: false,
        error: 'Only verified NGOs can publish requirements. Your verification is pending.',
      });
      return;
    }

    const body = req.body as z.infer<typeof CreateRequirementSchema>;

    const requirement = await RequirementsRepo.create({
      ngoId: ngoProfile.id,
      ngoName: ngoProfile.name,
      ...body,
      sdgTags: body.sdgTags as SDGNumber[],
      urgency: body.urgency as UrgencyLevel,
      volunteersAccepted: 0,
    });

    res.status(201).json({ ok: true, data: requirement });
  } catch (err) {
    next(err);
  }
});

// ─── Update Requirement (NGO owner only) ──────────────────────────────────────

const UpdateRequirementSchema = CreateRequirementSchema.partial().extend({
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).optional(),
});

router.put('/:id', requireAuth, requireRole('ngo'), validate(UpdateRequirementSchema), async (req: AuthRequest, res, next) => {
  try {
    const existing = RequirementsRepo.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
    if (!ngoProfile || existing.ngoId !== ngoProfile.id) {
      res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
      return;
    }

    const updated = await RequirementsRepo.update(req.params.id, req.body as any);
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Delete Requirement (NGO owner or Admin) ──────────────────────────────────

router.delete('/:id', requireAuth, requireRole('ngo', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const existing = RequirementsRepo.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    if (req.userRole === 'ngo') {
      const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
      if (!ngoProfile || existing.ngoId !== ngoProfile.id) {
        res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
        return;
      }
    }

    // Don't physically delete — cancel it
    await RequirementsRepo.update(req.params.id, { status: 'cancelled' });
    res.json({ ok: true, data: { message: 'Requirement cancelled.' } });
  } catch (err) {
    next(err);
  }
});

// ─── Get applications for a requirement (NGO owner only) ──────────────────────

router.get('/:id/applications', requireAuth, requireRole('ngo', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const existing = RequirementsRepo.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ ok: false, error: 'Requirement not found.' });
      return;
    }

    if (req.userRole === 'ngo') {
      const ngoProfile = NgoProfilesRepo.findByUserId(req.userId!);
      if (!ngoProfile || existing.ngoId !== ngoProfile.id) {
        res.status(403).json({ ok: false, error: 'You do not own this requirement.' });
        return;
      }
    }

    const applications = ApplicationsRepo.findByRequirementId(req.params.id);
    applications.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

    res.json({ ok: true, data: applications });
  } catch (err) {
    next(err);
  }
});

export default router;
