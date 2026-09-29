# NeedBridge 🌉
> A precision platform connecting NGOs, volunteers, and resource donors around tracked community needs with zero surplus wastage.

---

## 🌟 Key Capabilities & USP

- **Zero-Mismatch Resource Matching & Surplus Prevention Engine**:
  - **Phase 1 (Hard Filtering)**: Haversine radial distance geofencing (100km radius) and status checks.
  - **Phase 2 (Multi-Factor Scoring)**: 100-point compatibility score combining Proximity (40pts), Skill/Resource Jaccard Similarity (30pts), Urgency Multiplier (20pts), and Volunteer Reliability (10pts).
  - **Phase 3 (Bounded Quantity Allocation)**: Enforces $\text{Allocated Qty} = \min(\text{Donor Qty}, \text{Need Remaining})$ to eliminate surplus resource waste.
- **100% Offline-Capable & Self-Contained**:
  - Zero external API keys, cloud databases, hosted search, CDN, or third-party AI APIs.
  - In-house rule-based SmartText NLP keyword assistant for instant category, urgency, and UN SDG tag suggestions.
  - Self-hosted Google Fonts (`@fontsource-variable/plus-jakarta-sans`, `@fontsource/outfit`).
- **UN SDG Impact Matrix**:
  - Live fulfillment counters mapped against UN Sustainable Development Goals (SDGs 1–17).
- **Admin Verification Workflow**:
  - Document verification center for approving NGO registrations with society certificates and tax IDs.
- **Role-Aware Dashboards & Multi-Step Onboarding**:
  - Tailored 5-step wizard for Volunteers/Donors and 4-step wizard for NGOs with profile completeness meters.

---

## 🚀 Quick Start (Zero Config)

### Prerequisites
- Node.js 18+ and npm

### 1. Installation
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🧪 Automated Testing

Run the full end-to-end test suite verifying TC-01 through TC-08:
```bash
npm test
```

### Automated Test Cases Covered:
- `TC-01`: Auth & User Lifecycle (Register, JWT token sign/decode, password hash validation)
- `TC-02`: Role-Based Access Control (Volunteer RBAC isolation, unverified NGO gates)
- `TC-03`: NGO Verification Submission (Document upload & registration cert tracking)
- `TC-04`: Admin Review Workflow (Approval & status update with review notes)
- `TC-05`: Requirement Lifecycle (`draft` → `open` → `in_progress` → `completed`)
- `TC-06`: Multi-Factor Compatibility Scoring Engine & Zero-Wastage Bounded Allocation
- `TC-07`: Volunteer Application & Resource Pledge Workflow (Fulfillment & impact stats)
- `TC-08`: In-App Notifications & Offline SmartText Suggestion NLP

---

## 📋 Default Test Credentials

| Role | Email | Password | Status |
|---|---|---|---|
| **Admin** | `admin@needbridge.org` | `Admin@123` | Active Admin |
| **NGO (Verified)** | `helpinghandsngopune@gmail.com` | `Ngo@1234` | Verified NGO |
| **NGO (Pending)** | `ashafoundation@gmail.com` | `Ngo@1234` | Pending Review |
| **NGO (Verified)** | `healthfirstngo@gmail.com` | `Ngo@1234` | Verified NGO |
| **Volunteer / Donor** | `aarohi.sharma@example.org` | `Vol@1234` | Active Volunteer |
| **Volunteer / Donor** | `rohan.verma@example.org` | `Vol@1234` | Active Volunteer |

*(Tip: You can also use the Quick Fast-Fill buttons on the `/auth` login screen).*

---

## 🏛️ Project Architecture

```
/
├── server/
│   ├── index.ts               # Express server + Vite dev middleware / static prod
│   ├── config/env.ts          # Zod-validated environment config
│   ├── db/repositories/       # Swappable repository layer over fileStore
│   ├── db/fileStore.ts        # JSON database driver with mutex locks
│   ├── db/seed.ts             # Realistic seed data script
│   ├── routes/                # Auth, Volunteers, NGOs, Requirements, Admin, Public
│   ├── middleware/            # JWT auth, Zod validation, Multer upload, Rate limiting
│   ├── services/matching.ts   # Multi-factor score + Knapsack allocation engine
│   ├── services/smartText.ts  # Rule-based NLP keyword suggestion engine
│   └── tests/suite.test.ts    # End-to-end verification test suite (TC-01 to TC-08)
├── src/
│   ├── components/            # Navbar, Footer, PledgeModal, UI controls
│   ├── context/AuthContext.ts # Session persistence & auth state
│   ├── lib/api.ts             # Type-safe API client
│   ├── lib/copy.ts            # Centralized vocabulary and copy terms
│   └── pages/                 # HomePage, Opportunities, Ngos, Auth, Onboarding, Dashboards
├── shared/types.ts            # Canonical shared TypeScript models
└── docs/                      # AUDIT.md, API.md, ARCHITECTURE.md
```

---

## 📜 Documentation

- [System Architecture & USP Details](docs/ARCHITECTURE.md)
- [REST API Specification](docs/API.md)
- [Initial Frontend Audit](docs/AUDIT.md)
