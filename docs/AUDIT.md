# NeedBridge — Frontend Audit
*Generated: 2026-09-29 | Auditor: Antigravity Engineering*

---

## 1. Project Structure

```
src/
├── App.tsx                        # Root component, all state, view-router
├── main.tsx                       # ReactDOM.createRoot entry
├── index.css                      # Global Tailwind + custom CSS vars
├── types.ts                       # Shared TypeScript types
├── data/
│   └── mockData.ts                # Inline seed data (campaigns, opps, reviews…)
├── lib/
│   ├── storage.ts                 # localStorage CRUD wrapper (StorageService)
│   └── geo.ts                     # Haversine distance + popular location list
└── components/
    ├── Navbar.tsx                 # Sticky nav, login/join dropdowns, theme toggle
    ├── HeroSection.tsx            # Landing hero, 3-path CTA cards
    ├── HowItWorks.tsx             # Audience-specific 3-step explainer
    ├── NumbersStory.tsx           # Impact counter section
    ├── ReviewsSection.tsx         # User testimonials + add-review form
    ├── Footer.tsx                 # Site-wide footer
    ├── HelpingHandsLogo.tsx       # SVG brand logo + backdrop graphic
    ├── AuthModal.tsx              # Login / Signup modal (all roles)
    ├── dashboards/
    │   ├── VolunteerDashboard.tsx (112 KB!)
    │   ├── NgoDashboard.tsx        (82 KB!)
    │   └── DonorDashboard.tsx      (75 KB!)
    └── modals/
        ├── ApplyOpportunityModal.tsx
        ├── CampaignDetailsModal.tsx
        ├── CreateCampaignModal.tsx
        ├── DonateModal.tsx
        ├── OpportunityDetailsModal.tsx
        └── PostOpportunityModal.tsx
```

---

## 2. Routing & State

| Aspect | Current State |
|--------|--------------|
| Router | **None** — single `activeView` string in `App.tsx` state |
| URL | Never changes; back/forward buttons break UX |
| Auth | `currentUser` in React state + `localStorage` via `StorageService` |
| Persistence | All data in `localStorage` (survives refresh, lost if cleared) |
| Data fetching | **Zero** — all data from `localStorage` seeded from `mockData.ts` |
| Role switching | Quick-switcher dev toolbar at top of every page |

---

## 3. Screens Inventory

### Landing Page
- **Navbar** — Logo, nav links (scroll-to), Login dropdown, Join dropdown, theme toggle
- **HeroSection** — Tag line, 3-path cards (Volunteer / Donate / NGO), live stat counters
- **HowItWorks** — Tabbed audience explainer, 3 steps per role
- **NumbersStory** — Animated counters: NGOs, Volunteers, Funds, Impact
- **ReviewsSection** — Testimonial carousel + "Add your story" form
- **Footer** — Links, social, quick-register CTA

### Auth Modal
- Login tab: email/password → matched against `localStorage` users
- Signup tab: name, email, password, role selector (volunteer / ngo / donor_seeker)
- **No onboarding wizard** after signup — user dropped directly into dashboard

### Volunteer Dashboard (VolunteerDashboard.tsx)
Tabs: Home | Opportunities | My Applications | Impact | Profile

- Home: greeting, quick stats, recent activity
- Opportunities: filterable card grid of `VolunteerOpportunity[]` 
- My Applications: list of applied opportunities
- Impact: charts/stats (local mock data)
- Profile: edit form

### NGO Dashboard (NgoDashboard.tsx)
Tabs: Overview | Requirements | Volunteer Requests | Donations | Analytics | Profile

- Overview: stats, recent activity
- Requirements: "Campaigns" list + post new
- Volunteer Requests: accept/reject queue
- Donations: received list
- Analytics: charts (mock data)
- Profile: org details editor

### Donor Dashboard (DonorDashboard.tsx)
Tabs: Home | Campaigns | My Donations | Impact | Profile

- Home: recent campaigns
- Campaigns: browsable campaign grid, donate modal
- My Donations: history list
- Impact: SDG-aligned stats
- Profile: edit form

---

## 4. Data Models (Current vs. Target)

### Currently in `types.ts`
| Type | Notes |
|------|-------|
| `UserRole` | `'volunteer' \| 'ngo' \| 'donor_seeker'` — **donor_seeker** conflicts with spec (should be `volunteer` who contributes goods) |
| `UserProfile` | Flat, no password hash, stores raw `password` field |
| `Campaign` | Conflates NGO "requirement" + volunteer "opportunity" — **no unified `Requirement` type** |
| `VolunteerOpportunity` | Separate from Campaign — no `type: 'time'\|'goods'\|'both'` |
| `VolunteerRequest` | Application record — no `matchScore`, no `pledgedQuantity` |
| `DonationRecord` | Tracks money amounts — spec says track physical goods quantities only |

### Target data model changes (see spec §4.3)
- Merge `Campaign` + `VolunteerOpportunity` → `Requirement` with `type: 'time'|'goods'|'both'`
- `DonationRecord` → `Application` with `pledgedQuantity`, `kind`, `matchScore`
- Add `NgoProfile`, `VolunteerProfile`, `Notification`, `Category`, `Complaint`
- `UserRole` → `'volunteer' | 'ngo' | 'admin'` (donors are volunteers)

---

## 5. Where New Users Get Lost

### Volunteer/Donor
1. **No onboarding wizard** — after signup, user lands on a mostly-empty dashboard with no guidance
2. **Profile completeness** not shown — user doesn't know what to fill in
3. **Opportunities tab** is populated only from `localStorage` seed data; no server data
4. **"Apply" CTA** succeeds silently with no status feedback beyond state update
5. **Terminology confusion** — "Campaigns" (money?) vs "Opportunities" (time?) — no explanation

### NGO
1. **No verification gate** — any NGO can post "campaigns" immediately after signup
2. **Volunteer requests** have no context about which requirement they relate to
3. **Analytics** are entirely fake placeholder numbers
4. **No pending/verified status** shown

### All Roles
1. No `<title>` changes between views
2. No loading states
3. No empty states with guidance (just empty lists)
4. No error handling on form submission
5. Role quick-switcher bar looks like a dev tool — confuses real users
6. No keyboard navigation indicators
7. Unsaved form changes silently lost on modal close

---

## 6. External Dependencies (Violate Constraint §0)

| Dependency | Where Used | Action Required |
|-----------|-----------|----------------|
| Google Fonts CDN | `index.html` lines 8–10 | Self-host via `@fontsource` |
| Unsplash image URLs | `mockData.ts` everywhere | Replace with placeholder SVGs or generated assets |
| `@google/genai` package | `package.json` | **Remove** — never used in code |
| `metadata.json` `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` | `metadata.json` | Remove capability |

---

## 7. Missing Backend Gaps

| Feature | Current State |
|---------|--------------|
| Auth (JWT, bcrypt) | localStorage only, plain password in profile |
| Requirement CRUD | localStorage only |
| Application/Pledge flow | localStorage only, no bounded allocation |
| NGO verification workflow | No admin role, no document upload |
| Multi-factor matching engine | Haversine exists in `geo.ts`; no scoring, no skill matching |
| Zero-wastage bounded allocation | Not implemented |
| SDG tagging | Not implemented |
| Notifications | Not implemented |
| Admin panel | Not implemented |
| Impact/SDG dashboard API | Not implemented |

---

## 8. Code Quality Observations

- **VolunteerDashboard.tsx is 112 KB** — must be broken into sub-components
- **NgoDashboard.tsx is 82 KB** — same issue
- **No TypeScript strict mode** enforced (some `any` casts exist)
- Dashboard files use inline mock overrides that bypass `StorageService`
- `AuthModal.tsx` is 48 KB — does login, signup, role selector, profile creation all inline
- No shared UI component library (Button, Input, Card) — lots of duplicated Tailwind class strings

---

## 9. Existing Assets to Preserve

| Asset | Keep? | Notes |
|-------|-------|-------|
| `HelpingHandsLogo.tsx` | ✅ | Brand SVG — preserve exactly |
| `HelpingHandsGraphicBackdrop` | ✅ | Hero section backdrop graphic |
| Color palette (teal/amber/slate) | ✅ | Visual identity |
| Plus Jakarta Sans + Outfit fonts | ✅ | Self-host instead of CDN |
| Dark mode implementation | ✅ | Extend to all new screens |
| Haversine in `geo.ts` | ✅ | Promote to server `matching.ts` |
| Seed data locations/NGOs | ✅ | Migrate to `db/seed.ts` |

---

## 10. Implementation Plan Summary

Following the phases defined in §11 of the master prompt:

1. **Phase 1** — Audit ✅ (this document)
2. **Phase 2** — Backend foundation: Express + Vite middleware, repositories, JSON store, types, `/api/health`
3. **Phase 3** — Auth + RBAC (JWT/bcrypt, httpOnly cookies)
4. **Phase 4** — Core domain APIs (requirements, applications, pledges, NGO profiles)
5. **Phase 5** — NGO verification workflow (doc upload, admin review)
6. **Phase 6** — Multi-factor matching engine + SDG tagging
7. **Phase 7** — Admin APIs + impact/SDG reports
8. **Phase 8** — Frontend: router, API client, AuthContext, protected routes
9. **Phase 9** — Onboarding wizards, hero paths, nav, help page
10. **Phase 10** — Role dashboards and complete flows
11. **Phase 11** — Polish: accessibility, responsiveness, empty/error states
12. **Phase 12** — Documentation: README.md, API.md, ARCHITECTURE.md
