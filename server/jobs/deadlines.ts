/**
 * server/jobs/deadlines.ts — In-process notifier for approaching requirement deadlines.
 * No cron/external scheduler; runs on an interval while the server is up.
 */
import { RequirementsRepo, NgoProfilesRepo } from '../db/repositories/index.js';
import { notifyDeadlineApproaching } from '../services/notify.js';

const notified = new Set<string>();
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000; // hourly

async function scanDeadlines(): Promise<void> {
  const now = Date.now();
  const open = RequirementsRepo.findAll().filter(
    (r) => (r.status === 'open' || r.status === 'in_progress') && r.deadline
  );

  for (const req of open) {
    const due = Date.parse(req.deadline!);
    if (Number.isNaN(due)) continue;
    const remaining = due - now;
    if (remaining <= 0 || remaining > THREE_DAYS_MS) continue;

    const key = `${req.id}:${req.deadline}`;
    if (notified.has(key)) continue;

    const ngo = NgoProfilesRepo.findById(req.ngoId);
    if (!ngo) continue;

    const daysLeft = Math.max(1, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
    await notifyDeadlineApproaching(ngo.userId, req.title, req.id, daysLeft);
    notified.add(key);
  }
}

export function startDeadlineJob(): void {
  scanDeadlines().catch((err) => console.warn('[deadlines]', err));
  setInterval(() => {
    scanDeadlines().catch((err) => console.warn('[deadlines]', err));
  }, INTERVAL_MS);
}
