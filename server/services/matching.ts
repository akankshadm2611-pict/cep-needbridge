

import { Requirement, VolunteerProfile, MatchScore } from '../../shared/types.js';
import { RequirementsRepo } from '../db/repositories/index.js';

// ---------------------------------------------------------------------------
// Distance & Proximity Criteria Configuration
// ---------------------------------------------------------------------------

export const DISTANCE_CRITERIA = {
  MAX_RADIUS_KM: 100, // Maximum allowable radius for physical on-site drives
  LOCAL_RADIUS_KM: 15, // Hyper-local radius for high proximity bonus
  INTERMEDIATE_RADIUS_KM: 40, // Metro/district radius
};

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
  const R = 6371; // Earth radius in km
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

  // Solid Geofence: Skip for remote drives or if volunteer marked remote-only
  if (req.isRemote || profile.remoteOk) return true;

  if (
    req.location.latitude &&
    req.location.longitude &&
    profile.location?.latitude &&
    profile.location?.longitude
  ) {
    const dist = haversineKm(
      profile.location.latitude,
      profile.location.longitude,
      req.location.latitude,
      req.location.longitude
    );
    if (dist > DISTANCE_CRITERIA.MAX_RADIUS_KM) return false;
  } else if (req.location.city && profile.location?.city) {
    // City-level fallback hard filter: if both have cities but no GPS, cities must match or be in same state
    const cityMatch =
      req.location.city.trim().toLowerCase() === profile.location.city.trim().toLowerCase();
    if (!cityMatch && (!req.location.state || req.location.state !== profile.location?.state)) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Phase 2: Multi-factor scoring (0–100)
// ---------------------------------------------------------------------------

/**
 * Solid Distance & Proximity Scoring (0–40 pts):
 * - Remote / Online: 35 pts (consistent accessibility)
 * - Hyper-local (<= 15 km): 40 pts (walkable / short commute)
 * - District / Metro (15 - 40 km): 30 pts
 * - Regional (40 - 75 km): 20 pts
 * - Outer Boundary (75 - 100 km): 10 pts
 * - > 100 km: 0 pts
 */
function locationScore(
  req: Requirement,
  profile: VolunteerProfile
): { score: number; distanceKm?: number } {
  if (req.isRemote || profile.remoteOk) return { score: 35, distanceKm: 0 };

  if (
    req.location.latitude &&
    req.location.longitude &&
    profile.location?.latitude &&
    profile.location?.longitude
  ) {
    const dist = haversineKm(
      profile.location.latitude,
      profile.location.longitude,
      req.location.latitude,
      req.location.longitude
    );

    let score = 0;
    if (dist <= DISTANCE_CRITERIA.LOCAL_RADIUS_KM) {
      // 0–15 km: 40 down to 34
      score = 40 - (dist / DISTANCE_CRITERIA.LOCAL_RADIUS_KM) * 6;
    } else if (dist <= DISTANCE_CRITERIA.INTERMEDIATE_RADIUS_KM) {
      // 15–40 km: 34 down to 24
      score = 34 - ((dist - 15) / 25) * 10;
    } else if (dist <= DISTANCE_CRITERIA.MAX_RADIUS_KM) {
      // 40–100 km: 24 down to 6
      score = 24 - ((dist - 40) / 60) * 18;
    } else {
      score = 0;
    }

    return { score: Math.max(0, Math.round(score)), distanceKm: Math.round(dist * 10) / 10 };
  }

  // Fallback if coordinates missing: City name match
  if (
    req.location.city &&
    profile.location?.city &&
    req.location.city.trim().toLowerCase() === profile.location.city.trim().toLowerCase()
  ) {
    return { score: 30 }; // Same city
  }

  return { score: 10 }; // Same region estimate
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


//  * allocated = min(offered, max(0, needed - pledged))
//  */
export function calculateBoundedQuantity(offeredQty: number, quantityNeeded: number, quantityPledged = 0): number {
  const remaining = Math.max(0, quantityNeeded - quantityPledged);
  return Math.max(0, Math.min(offeredQty, remaining));
}


export function boundedAllocate(offeredQty: number, requirementId: string): number {
  const req = RequirementsRepo.findById(requirementId);
  if (!req || !req.resourceNeeded) return 0;

  return calculateBoundedQuantity(offeredQty, req.resourceNeeded.quantityNeeded, req.resourceNeeded.quantityPledged);
}

// -------------------------------------------------------------------------

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
