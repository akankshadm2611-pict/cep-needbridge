/**
 * server/routes/uploads.ts — Serve uploaded files (authenticated).
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { NgoProfilesRepo } from '../db/repositories/index.js';

const router = Router();

// Serve verification documents (only to the owning NGO or admin)
router.get('/:filename', requireAuth, (req: AuthRequest, res, next) => {
  try {
    const { filename } = req.params;
    // Sanitize: prevent path traversal
    const safe = path.basename(filename);
    const filePath = path.resolve(env.UPLOAD_DIR, safe);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ ok: false, error: 'File not found.' });
      return;
    }

    // Admins can review all documents; NGOs can only access their own.
    if (req.userRole === 'ngo') {
      const profile = NgoProfilesRepo.findByUserId(req.userId!);
      const owns = profile?.verificationDocuments.some(d => d.filename === safe);
      if (!owns) {
        res.status(403).json({ ok: false, error: 'Access denied.' });
        return;
      }
    } else if (req.userRole !== 'admin') {
      res.status(403).json({ ok: false, error: 'Access denied.' });
      return;
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

export default router;
