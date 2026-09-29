/**
 * server/routes/notifications.ts — In-app notifications.
 */
import { Router } from 'express';
import { NotificationsRepo } from '../db/repositories/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── List my notifications ────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notifs = NotificationsRepo.findByUserId(req.userId!);
    const unread = NotificationsRepo.countUnread(req.userId!);
    res.json({ ok: true, data: { notifications: notifs, unreadCount: unread } });
  } catch (err) {
    next(err);
  }
});

// ─── Mark single notification read ───────────────────────────────────────────

router.put('/:id/read', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notif = NotificationsRepo.findById(req.params.id);
    if (!notif || notif.userId !== req.userId) {
      res.status(404).json({ ok: false, error: 'Notification not found.' });
      return;
    }
    const updated = await NotificationsRepo.markRead(req.params.id);
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Mark all read ────────────────────────────────────────────────────────────

router.put('/read-all', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await NotificationsRepo.markAllRead(req.userId!);
    res.json({ ok: true, data: { message: 'All notifications marked as read.' } });
  } catch (err) {
    next(err);
  }
});

// ─── Delete notification ──────────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notif = NotificationsRepo.findById(req.params.id);
    if (!notif || notif.userId !== req.userId) {
      res.status(404).json({ ok: false, error: 'Notification not found.' });
      return;
    }
    await NotificationsRepo.delete(req.params.id);
    res.json({ ok: true, data: { message: 'Notification deleted.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
