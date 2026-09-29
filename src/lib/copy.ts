/**
 * src/lib/copy.ts — Centralized platform vocabulary and UI copy.
 * Single source of truth for labels, role terminology, and status badges.
 */

export const PLATFORM_COPY = {
  appName: 'NeedBridge',
  tagline: 'Bridging community needs with verified action — zero wastage guaranteed.',
  
  // ─── Terminology by role ─────────────────────────────────────────────
  volunteer: {
    roleLabel: 'Volunteer / Donor',
    browseTitle: 'Explore Opportunities',
    browseSubtitle: 'Find community requirements where your skills and resources make the highest direct impact.',
    applyAction: 'I Want to Help',
    pledgeAction: 'Pledge Resources',
    myItemsTitle: 'My Applications & Pledges',
  },
  ngo: {
    roleLabel: 'Non-Governmental Organization (NGO)',
    browseTitle: 'Manage Requirements',
    browseSubtitle: 'Post structured needs for volunteer time and goods. Zero over-allocation guaranteed.',
    createAction: 'Post New Requirement',
    myItemsTitle: 'Our Posted Requirements',
  },
  admin: {
    roleLabel: 'Platform Administrator',
    dashboardTitle: 'NeedBridge Admin & Oversight',
    verificationTitle: 'NGO Verification Center',
  },

  // ─── Verification Status Copy ─────────────────────────────────────────
  verification: {
    pending: {
      label: 'Under Review',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      description: 'Your registration documents have been received and are being reviewed by our verification team.',
      canPost: false,
    },
    verified: {
      label: 'Verified NGO',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      description: 'Your organization is fully verified. All published requirements are live in the community catalog.',
      canPost: true,
    },
    rejected: {
      label: 'Needs Attention',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      description: 'Additional documentation is required before requirements can be published.',
      canPost: false,
    },
  },

  // ─── Requirement Status Badges ────────────────────────────────────────
  requirementStatus: {
    draft: { label: 'Draft', color: 'slate' },
    open: { label: 'Open', color: 'emerald' },
    in_progress: { label: 'In Progress', color: 'blue' },
    completed: { label: 'Completed', color: 'purple' },
    cancelled: { label: 'Cancelled', color: 'rose' },
  },

  // ─── Application Status Badges ────────────────────────────────────────
  applicationStatus: {
    pending: { label: 'Pending Review', color: 'amber' },
    accepted: { label: 'Accepted', color: 'emerald' },
    rejected: { label: 'Not Selected', color: 'rose' },
    withdrawn: { label: 'Withdrawn', color: 'slate' },
  },

  // ─── Urgency Levels ───────────────────────────────────────────────────
  urgency: {
    critical: { label: 'Critical / Emergency', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' },
    high: { label: 'High Priority', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' },
    normal: { label: 'Standard', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' },
    low: { label: 'Flexible', color: 'slate', bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  },

  // ─── Zero Wastage Guarantee Explainer ────────────────────────────────
  zeroWasteUSP: {
    title: 'Zero-Mismatch & Surplus Prevention Engine',
    tagline: 'Precision Allocation. Zero Community Waste.',
    description: 'Our bounded allocation algorithm strictly caps resource pledges to the actual unmet quantity needed. We prevent hoarding, spoilage, and unnecessary surplus donations.',
  }
};
