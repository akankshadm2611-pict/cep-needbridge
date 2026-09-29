# NeedBridge — System Architecture & USP Documentation

---

## 1. System Architecture Overview

NeedBridge is engineered with a **Modular Full-Stack TypeScript Architecture** where the client and server share core type contracts (`shared/types.ts`) and operate with **100% offline capability** (no external AI, Maps, Firebase, CDN, or third-party cloud APIs).

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│    React 19 + TypeScript + Vite + Tailwind CSS + motion │
│   (AuthContext, Self-Hosted Fonts, Accessible Semantic) │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON (JWT Cookies)
┌────────────────────────────▼────────────────────────────┐
│                    Express API Layer                    │
│   • Middleware: RateLimiter, Helmet, Zod Validator, JWT  │
│   • Domain Routers: Auth, NGOs, Volunteers, Reqs, Admin │
└────────────────────────────┬────────────────────────────┘
                             │
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       Core In-House Engines   │    │      Repository Abstraction   │
│  1. Multi-Factor Match Engine│    │  `server/db/repositories/`   │
│  2. Bounded Allocation Guard │    │ (findById, find, create...)  │
│  3. Offline SmartText NLP    │    └──────────────┬───────────────┘
└──────────────────────────────┘                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │    JSON File Storage Driver  │
                                    │     `server/db/fileStore.ts` │
                                    │   (In-Memory Cache + Mutex)  │
                                    └──────────────────────────────┘
```

---

## 2. Core USP: Zero-Mismatch & Surplus Prevention Engine

The core differentiator of NeedBridge is guaranteeing that community requirements receive the exact required resources without over-allocation, spoilage, or misallocated skills.

### Phase 1: Hard Geofence & Availability Filter
1. Geofencing check: Using the spherical Haversine formula, requirements beyond the maximum radius (100 km) are excluded (unless marked as remote/online).
2. Status filter: Requirements must be in `status === 'open'`.
3. Unmet need check:
   - For volunteer time: `volunteersAccepted < volunteersNeeded`
   - For goods: `quantityPledged < quantityNeeded`

### Phase 2: Multi-Factor Compatibility Scoring (0–100)
Every candidate volunteer/donor is evaluated across four weighted dimensions:

$$\text{Score} = \text{Proximity} (40) + \text{Skill Match} (30) + \text{Urgency} (20) + \text{Reliability} (10)$$

1. **Location Proximity ($0 - 40\text{ pts}$)**:
   $$d = 2R \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lon}}{2}\right) } \right)$$
   $$\text{Proximity Score} = \max\left(0, 40 \times \left(1 - \frac{d}{100\text{ km}}\right)\right)$$

2. **Skill / Resource Specification Vector Match ($0 - 30\text{ pts}$)**:
   Jaccard similarity index between volunteer skills/resources and requirement specifications:
   $$J(V, R) = \frac{|V \cap R|}{|V \cup R|}$$
   $$\text{Skill Score} = \text{round}(30 \times J(V, R))$$

3. **Urgency Multiplier ($0 - 20\text{ pts}$)**:
   - Critical / Emergency: $20\text{ pts} \ (1.0\times)$
   - High Priority: $16\text{ pts} \ (0.8\times)$
   - Standard: $10\text{ pts} \ (0.5\times)$
   - Flexible: $4\text{ pts} \ (0.2\times)$

4. **Reliability Score ($0 - 10\text{ pts}$)**:
   Based on historical fulfillment rate of accepted commitments:
   $$\text{Reliability Score} = \text{round}\left(10 \times \frac{\text{Reliability Rating}}{100}\right)$$

### Phase 3: Bounded Quantity Allocation (Surplus Prevention Guard)
To eliminate surplus waste, the system enforces a strict bounded cap:

$$\text{Remaining Needed} = \max(0, \text{Quantity Needed} - \text{Quantity Pledged})$$
$$\text{Allocated Quantity} = \min(\text{Donor Offered Quantity}, \text{Remaining Needed})$$

If a donor offers 50 blankets for a drive that only needs 30 remaining, the system strictly allocates 30, preventing 20 items from being wasted or hoarded.

---

## 3. Storage Layer & Database Driver Swapping

All persistent operations in NeedBridge are mediated by repository interfaces defined in `server/db/repositories/index.ts`. No route or service interacts directly with disk I/O.

### How to Swap the JSON Driver for PostgreSQL / MongoDB:
1. Implement the repository methods (`findById`, `find`, `create`, `update`, `delete`) using an ORM or driver (e.g., Prisma, Drizzle, or Mongoose).
2. Maintain the exact same repository interface signatures.
3. Replace the import in `server/db/repositories/index.ts`. No frontend or API route changes are required.

---

## 4. Verification Workflow & UN SDG Tracking

1. **NGO Registration**: NGO creates an account and uploads registration certificates / 80G tax exemption documents.
2. **Admin Review**: Platform administrator inspects documents in `/api/admin/pending-ngos` and marks status as `verified` or `rejected`.
3. **Requirement Lifecycle**: `draft` → `open` → `in_progress` → `completed`.
4. **UN SDG Tracking**: Every fulfilled requirement increments live impact counters mapped across UN SDGs 1 through 17.
