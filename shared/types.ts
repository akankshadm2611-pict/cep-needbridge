/**
 * shared/types.ts — Canonical data models shared by server and client.
 * Server-only concerns (passwordHash, etc.) stay in server/models/.
 */

// ---------------------------------------------------------------------------
// Roles & Enums
// ---------------------------------------------------------------------------

export type UserRole = 'volunteer' | 'ngo' | 'admin';
export type ContributionType = 'time' | 'goods' | 'both';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type RequirementStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ApplicationKind = 'time' | 'goods';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical';

// ---------------------------------------------------------------------------
// SDG Tags (1-17)
// ---------------------------------------------------------------------------

export type SDGNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export const SDG_LABELS: Record<SDGNumber, string> = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health & Well-being',
  4: 'Quality Education',
  5: 'Gender Equality',
  6: 'Clean Water & Sanitation',
  7: 'Affordable & Clean Energy',
  8: 'Decent Work & Economic Growth',
  9: 'Industry, Innovation & Infrastructure',
  10: 'Reduced Inequalities',
  11: 'Sustainable Cities & Communities',
  12: 'Responsible Consumption & Production',
  13: 'Climate Action',
  14: 'Life Below Water',
  15: 'Life on Land',
  16: 'Peace, Justice & Strong Institutions',
  17: 'Partnerships for the Goals',
};

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: UserRole;
  /** pending = email not verified yet, active = normal, suspended = admin action */
  status: 'pending' | 'active' | 'suspended';
  onboardingComplete: boolean;
  recoveryQuestion?: string;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// NGO Profile
// ---------------------------------------------------------------------------

export interface NgoProfile {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  description?: string;
  organizationType?: string;
  registrationNumber?: string;
  causeAreas: string[];
  sdgTags: SDGNumber[];
  location: GeoLocation;
  contact: ContactInfo;
  website?: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  verificationDocuments: VerificationDocument[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Volunteer Profile
// ---------------------------------------------------------------------------

export interface VolunteerProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  contributionType: ContributionType;
  skills: string[];
  resourceCategories: string[];
  education?: string;
  experience?: string;
  interests: string[];
  preferredCategories: string[];
  sdgInterests: SDGNumber[];
  location?: GeoLocation;
  remoteOk: boolean;
  availability: AvailabilityInfo;
  reliabilityScore: number; // 0-100, computed from past completions
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Requirement (unified: time / goods / both)
// ---------------------------------------------------------------------------

export interface ResourceSpec {
  itemName: string;
  unit: string;
  quantityNeeded: number;
  quantityPledged: number; // always <= quantityNeeded (enforced server-side)
}

export interface Requirement {
  id: string;
  ngoId: string;
  ngoName: string; // denormalized for display
  title: string;
  description: string;
  category: string;
  type: ContributionType;
  skillsRequired: string[];
  resourceNeeded?: ResourceSpec;
  volunteersNeeded: number;
  volunteersAccepted: number;
  location: GeoLocation;
  isRemote: boolean;
  startDate?: string;
  duration?: string;
  deadline?: string;
  urgency: UrgencyLevel;
  status: RequirementStatus;
  sdgTags: SDGNumber[];
  peopleHelped: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Application (time volunteer) / Pledge (goods donor)
// ---------------------------------------------------------------------------

export interface Application {
  id: string;
  requirementId: string;
  volunteerId: string;
  volunteerName: string; // denormalized
  message?: string;
  kind: ApplicationKind;
  pledgedQuantity?: number; // for goods applications — bounded server-side
  allocatedQuantity?: number; // actual allocated after bounded algorithm
  status: ApplicationStatus;
  appliedAt: string;
  decidedAt?: string;
  hoursLogged?: number;
  fulfilled: boolean;
  matchScore?: number; // 0-100 from matching engine
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  userId: string;
  type: 'application_accepted' | 'application_rejected' | 'requirement_posted' | 'verification_update' | 'pledge_fulfilled' | 'deadline_approaching' | 'general';
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Auxiliary Types
// ---------------------------------------------------------------------------

export interface GeoLocation {
  address?: string;
  city: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  name?: string;
}

export interface VerificationDocument {
  id: string;
  filename: string;
  originalName: string;
  uploadedAt: string;
  mimeType: string;
}

export interface AvailabilityInfo {
  days: string[]; // e.g. ['Monday', 'Wednesday', 'Friday']
  hoursPerWeek?: number;
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

// ---------------------------------------------------------------------------
// Impact & SDG Report
// ---------------------------------------------------------------------------

export interface ImpactStats {
  ngosCount: number;
  verifiedNgosCount: number;
  volunteersCount: number;
  requirementsCount: number;
  openRequirementsCount: number;
  applicationsCount: number;
  acceptedApplicationsCount: number;
  fulfillmentRate: number; // %
  totalPeopleHelped: number;
  sdgBreakdown: Partial<Record<SDGNumber, number>>; // people helped per SDG
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiErr {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

export interface MatchScore {
  requirementId: string;
  totalScore: number;          // 0-100
  proximityScore: number;      // 0-40
  skillScore: number;          // 0-30
  urgencyScore: number;        // 0-20
  reliabilityScore: number;    // 0-10
  distanceKm?: number;
  allocatedQty?: number;       // bounded allocation result
}
