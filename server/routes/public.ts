/**
 * server/routes/public.ts — Public read-only routes (no auth required).
 */
import { Router, type Request, type Response } from 'express';
import {
  RequirementsRepo,
  NgoProfilesRepo,
  UsersRepo,
  ApplicationsRepo,
  CategoriesRepo,
} from '../db/repositories/index.js';
import type { ImpactStats, SDGNumber } from '../../shared/types.js';

const router = Router();

// ─── /api/health ─────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
  res.json({ ok: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// ─── /api/impact — Live impact counters (used on landing page) ───────────────

router.get('/impact', (req, res) => {
  const allNgos = NgoProfilesRepo.findAll();
  const allUsers = UsersRepo.findAll();
  const allReqs = RequirementsRepo.findAll();
  const allApps = ApplicationsRepo.findAll();

  const sdgBreakdown: Partial<Record<SDGNumber, number>> = {};
  for (const r of allReqs) {
    if (r.status === 'completed') {
      for (const sdg of r.sdgTags) {
        sdgBreakdown[sdg] = (sdgBreakdown[sdg] ?? 0) + r.peopleHelped;
      }
    }
  }

  const stats: ImpactStats = {
    ngosCount: allNgos.filter(n => n.verificationStatus === 'verified').length,
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
    totalPeopleHelped: allReqs.reduce((sum, r) => sum + r.peopleHelped, 0),
    sdgBreakdown,
  };

  res.json({ ok: true, data: stats });
});

// ─── /api/requirements/featured — Open requirements (browsable without login) ─

router.get('/categories', (_req, res) => {
  res.json({ ok: true, data: CategoriesRepo.findActive() });
});

function featuredRequirements(_req: Request, res: Response) {
  const open = RequirementsRepo.findAll()
    .filter((r) => r.status === 'open')
    .sort((a, b) => {
      const urgencyOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
      return (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
    })
    .slice(0, 6);
  res.json({ ok: true, data: open });
}

function featuredNgos(_req: Request, res: Response) {
  const verified = NgoProfilesRepo.findAll()
    .filter((n) => n.verificationStatus === 'verified')
    .slice(0, 6);
  res.json({ ok: true, data: verified });
}

router.get('/featured/requirements', featuredRequirements);
router.get('/requirements/featured', featuredRequirements);
router.get('/featured/ngos', featuredNgos);
router.get('/ngos/featured', featuredNgos);

// ─── /api/suggest — Smart text analysis for requirement creation ──────────────

router.post('/suggest', async (req, res, next) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || text.trim().length < 10) {
      res.status(400).json({ ok: false, error: 'Please provide at least 10 characters of text.' });
      return;
    }
    const { analyzeText } = await import('../services/smartText.js');
    const suggestions = analyzeText(text);
    res.json({ ok: true, data: suggestions });
  } catch (err) {
    next(err);
  }
});

export default router;
