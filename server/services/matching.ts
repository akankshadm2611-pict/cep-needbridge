/**
 * server/services/matching.ts
 *
 * Multi-Factor Compatibility Scoring + Bounded Quantity Allocation Engine.
 *
 * Phase 1: Hard filtering (geofence, status)
 * Phase 2: Multi-factor scoring (location, skills, urgency, reliability)
 * Phase 3: Bounded allocation = min(donor_qty, remaining_qty)
 */

import { Requirement, VolunteerProfile, MatchScore } from '../../shared/types.js';
import { RequirementsRepo } from '../db/repositories/index.js';

const MAX_RADIUS_KM = 100; // hard geofence
const URGENCY_MULTIPLIER: Record<string, number> = {
  critical: 1.0,
  high: 0.8,
  normal: 0.5,
  low: 0.2,
};

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Phase 1: Hard filters
// ---------------------------------------------------------------------------

function passesHardFilter(req: Requirement, profile: VolunteerProfile): boolean {
  // Status must be open
  if (req.status !== 'open') return false;

  // Contribution type compatibility
  if (req.type === 'time' && profile.contributionType === 'goods') return false;
  if (req.type === 'goods' && profile.contributionType === 'time') return false;

  // If goods requirement: check quantityPledged < quantityNeeded
  if (req.type === 'goods' && req.resourceNeeded) {
    if (req.resourceNeeded.quantityPledged >= req.resourceNeeded.quantityNeeded) return false;
  }

  // If time requirement: check volunteersAccepted < volunteersNeeded
  if (req.type === 'time' && req.volunteersAccepted >= req.volunteersNeeded) return false;

  // Geofence (skip if remote or no coordinates)
  if (!req.isRemote && req.location.latitude && req.location.longitude &&
      profile.location?.latitude && profile.location?.longitude) {
    const dist = haversineKm(
      profile.location.latitude, profile.location.longitude,
      req.location.latitude!, req.location.longitude!
    );
    if (dist > MAX_RADIUS_KM) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Phase 2: Multi-factor scoring (0–100)
// ---------------------------------------------------------------------------

/**
 * Location Proximity Score (0–40)
 * Full 40 pts at 0km, linear decay to 0 at MAX_RADIUS_KM.
 */
function locationScore(req: Requirement, profile: VolunteerProfile): { score: number; distanceKm?: number } {
  if (req.isRemote || profile.remoteOk) return { score: 40 };
  if (!req.location.latitude || !profile.location?.latitude) return { score: 20 }; // city-level estimate

  const dist = haversineKm(
    profile.location.latitude, profile.location.longitude!,
    req.location.latitude, req.location.longitude!
  );
  const score = Math.max(0, 40 * (1 - dist / MAX_RADIUS_KM));
  return { score: Math.round(score), distanceKm: dist };
}

/**
 * Skill/Specification Vector Match Score (0–30)
 * Jaccard similarity between volunteer skills and requirement skills.
 */
function skillScore(req: Requirement, profile: VolunteerProfile): number {
  if (req.skillsRequired.length === 0) return 30; // no skills needed = perfect

  const reqSkills = new Set(req.skillsRequired.map(s => s.toLowerCase()));
  const volSkills = new Set(profile.skills.map(s => s.toLowerCase()));

  // Also check resource categories for goods requirements
  if (req.type === 'goods') {
    profile.resourceCategories.forEach(rc => volSkills.add(rc.toLowerCase()));
  }

  const intersection = new Set([...reqSkills].filter(s => volSkills.has(s)));
  const union = new Set([...reqSkills, ...volSkills]);
  const jaccard = union.size === 0 ? 0 : intersection.size / union.size;

  return Math.round(30 * jaccard);
}

/**
 * Urgency & Priority Score (0–20)
 */
function urgencyScore(req: Requirement): number {
  const mult = URGENCY_MULTIPLIER[req.urgency] ?? 0.5;
  return Math.round(20 * mult);
}

/**
 * Reliability Score (0–10)
 * Based on volunteer's historical completion rate.
 */
function reliabilityScore(profile: VolunteerProfile): number {
  return Math.round((profile.reliabilityScore / 100) * 10);
}

// ---------------------------------------------------------------------------
/**
 * Pure helper for zero-wastage allocation:
 * allocated = min(offered, max(0, needed - pledged))
 */
export function calculateBoundedQuantity(offeredQty: number, quantityNeeded: number, quantityPledged = 0): number {
  const remaining = Math.max(0, quantityNeeded - quantityPledged);
  return Math.max(0, Math.min(offeredQty, remaining));
}

/**
 * Guarantee zero surplus wastage:
 * allocated = min(donor_offered_qty, need_remaining_qty)
 */
export function boundedAllocate(offeredQty: number, requirementId: string): number {
  const req = RequirementsRepo.findById(requirementId);
  if (!req || !req.resourceNeeded) return 0;

  return calculateBoundedQuantity(offeredQty, req.resourceNeeded.quantityNeeded, req.resourceNeeded.quantityPledged);
}

// ---------------------------------------------------------------------------
// Main: Score a volunteer against a single requirement
// ---------------------------------------------------------------------------

export function scoreRequirementForVolunteer(
  req: Requirement,
  profile: VolunteerProfile
): MatchScore | null {
  if (!passesHardFilter(req, profile)) return null;

  const loc = locationScore(req, profile);
  const skill = skillScore(req, profile);
  const urgency = urgencyScore(req);
  const reliability = reliabilityScore(profile);

  const total = loc.score + skill + urgency + reliability;

  return {
    requirementId: req.id,
    totalScore: Math.min(100, total),
    proximityScore: loc.score,
    skillScore: skill,
    urgencyScore: urgency,
    reliabilityScore: reliability,
    distanceKm: loc.distanceKm,
  };
}

export function calculateMatchScore(
  profile: VolunteerProfile,
  req: Requirement
): MatchScore {
  const loc = locationScore(req, profile);
  const skill = skillScore(req, profile);
  const urgency = urgencyScore(req);
  const reliability = reliabilityScore(profile);

  const total = loc.score + skill + urgency + reliability;

  return {
    requirementId: req.id,
    totalScore: Math.min(100, total),
    proximityScore: loc.score,
    skillScore: skill,
    urgencyScore: urgency,
    reliabilityScore: reliability,
    distanceKm: loc.distanceKm,
  };
}

// ---------------------------------------------------------------------------
// Match: rank all open requirements for a volunteer
// ---------------------------------------------------------------------------

export function getMatchedRequirements(
  profile: VolunteerProfile,
  requirements: Requirement[],
  topN = 20
): Array<Requirement & { _matchScore: MatchScore }> {
  const scored: Array<{ req: Requirement; score: MatchScore }> = [];

  for (const req of requirements) {
    const score = scoreRequirementForVolunteer(req, profile);
    if (score !== null) {
      scored.push({ req, score });
    }
  }

  // Sort descending by totalScore
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore);

  return scored.slice(0, topN).map(({ req, score }) => ({
    ...req,
    _matchScore: score,
  }));
}
