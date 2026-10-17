/**
 * server/routes/uploads.ts — Serve uploaded files (authenticated).
 */
import { Router } from "express";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { NgoProfilesRepo } from "../db/repositories/index.js";
import { mongoReadUpload } from "../db/mongo.js";

const router = Router();

// Serve verification documents (only to the owning NGO or admin)
router.get("/:filename", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { filename } = req.params;
    // Sanitize: prevent path traversal
    const safe = path.basename(filename);
    const filePath = path.resolve(env.UPLOAD_DIR, safe);

    if (process.env.VERCEL !== "1" && !fs.existsSync(filePath)) {
      res.status(404).json({ ok: false, error: "File not found." });
      return;
    }

    // Admins can review all documents; NGOs can only access their own.
    if (req.userRole === "ngo") {
      const profile = NgoProfilesRepo.findByUserId(req.userId!);
      const owns = profile?.verificationDocuments.some(
        (d) => d.filename === safe,
      );
      if (!owns) {
        res.status(403).json({ ok: false, error: "Access denied." });
        return;
      }
    } else if (req.userRole !== "admin") {
      res.status(403).json({ ok: false, error: "Access denied." });
      return;
    }

    if (process.env.VERCEL === "1") {
      const storedFile = await mongoReadUpload(safe);
      if (!storedFile) {
        res.status(404).json({ ok: false, error: "File not found." });
        return;
      }
      res.setHeader("Content-Type", storedFile.contentType || "application/octet-stream");
      res.setHeader("X-Content-Type-Options", "nosniff");
      storedFile.stream.once("error", (err) => {
        if (res.headersSent) res.destroy(err);
        else next(err);
      });
      storedFile.stream.pipe(res);
      return;
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

export default router;
