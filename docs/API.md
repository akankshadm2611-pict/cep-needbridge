# NeedBridge — REST API Specification
*Version: 1.0.0 | Base URL: `/api` | Format: JSON*

All responses follow the standard envelope format:
```json
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": "Human readable error message", "details": { ... } }
```

---

## 1. Public Endpoints (No Auth Required)

### `GET /api/health`
Health check and uptime status.

### `GET /api/impact`
Live community impact metrics aligned with UN SDGs.
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "ngosCount": 12,
      "verifiedNgosCount": 12,
      "volunteersCount": 48,
      "requirementsCount": 24,
      "openRequirementsCount": 18,
      "applicationsCount": 56,
      "acceptedApplicationsCount": 45,
      "fulfillmentRate": 89,
      "totalPeopleHelped": 1420,
      "sdgBreakdown": { "1": 150, "2": 420, "4": 650, "10": 200 }
    }
  }
  ```

### `GET /api/featured/requirements`
Returns top open requirements for public landing preview.

### `GET /api/featured/ngos`
Returns featured verified partner NGOs.

### `GET /api/categories`
Returns active category taxonomies.

### `POST /api/suggest`
Offline rule-based keyword analyzer for auto-suggesting categories, urgency, contribution type, and SDG tags.
- **Request Body:** `{ "text": "Need 50 blankets and warm clothes urgently for flood victims." }`
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "category": "Disaster Relief",
      "urgency": "critical",
      "contributionType": "goods",
      "sdgTags": [1, 13],
      "skills": ["First Aid", "Logistics"]
    }
  }
  ```

---

## 2. Authentication (`/api/auth`)

Authentication uses HTTP-only `token` cookies.

### `POST /api/auth/register`
- **Body:** `{ "email": "user@example.org", "password": "Password@123", "role": "volunteer" | "ngo" | "admin", "name": "Optional Name" }`
- **Response:** `{ "ok": true, "data": { "user": User, "profile": Profile } }`

### `POST /api/auth/login`
- **Body:** `{ "email": "user@example.org", "password": "Password@123" }`
- **Response:** `{ "ok": true, "data": { "user": User, "profile": Profile } }`

### `POST /api/auth/logout`
Clears session cookie.

### `GET /api/auth/me`
Returns currently authenticated user and profile.

---

## 3. Requirements (`/api/requirements`)

### `GET /api/requirements`
Query parameters: `category`, `type` (`time`|`goods`|`both`), `urgency` (`low`|`normal`|`high`|`critical`), `sdgTag` (1–17), `search`, `status` (`open`|`draft`|`completed`).

### `POST /api/requirements` (NGO Only)
Creates a new structured requirement. Verified NGOs publish as `open`; unverified NGOs create as `draft`.
- **Body:**
  ```json
  {
    "title": "School Stationery Distribution",
    "description": "Distributing 100 notebooks and pens to primary students.",
    "category": "Education",
    "type": "goods",
    "resourceNeeded": {
      "itemName": "Notebook Kits",
      "unit": "kits",
      "quantityNeeded": 100
    },
    "sdgTags": [4, 10],
    "urgency": "high",
    "location": { "city": "Pune" }
  }
  ```

### `PATCH /api/requirements/:id/status` (NGO/Admin)
Updates requirement lifecycle: `draft` → `open` → `in_progress` → `completed` → `cancelled`.

---

## 4. Applications & Goods Pledges (`/api/applications`)

### `POST /api/applications`
Volunteer applies for time or pledges physical goods.
- **Body:**
  ```json
  {
    "requirementId": "req_123",
    "kind": "goods",
    "pledgedQuantity": 40,
    "message": "Can supply 40 kits from our community drive."
  }
  ```
- **Bounded Allocation:** Server automatically computes `allocatedQuantity = min(offered, remainingNeed)`.

### `PATCH /api/applications/:id/status` (NGO Only)
Accept (`status: "accepted"`) or decline (`status: "rejected"`) applicant.

### `POST /api/applications/:id/withdraw` (Volunteer Only)
Volunteer withdraws pending application.

### `PATCH /api/applications/:id/fulfill` (NGO Only)
Marks application as fulfilled upon physical goods handover or service completion, updating SDG impact stats.

---

## 5. Volunteers (`/api/volunteers`)

### `GET /api/volunteers/me/matches`
Runs the Multi-Factor Compatibility Scoring Engine across all open requirements:
- **Proximity Score (40 pts)**: Haversine distance decay (0 to 100 km)
- **Skill Vector Match (30 pts)**: Jaccard similarity index
- **Urgency Multiplier (20 pts)**: Critical (1.0x) > High (0.8x) > Normal (0.5x) > Low (0.2x)
- **Reliability Rating (10 pts)**: Historical fulfillment rate

### `PATCH /api/volunteers/me`
Updates skills, causes, availability, and location coordinates.

---

## 6. NGOs (`/api/ngos`)

### `GET /api/ngos`
Lists verified partner NGOs.

### `POST /api/ngos/me/documents`
Uploads verification certificates (PDF/images) via local file storage.

---

## 7. Admin (`/api/admin`)

### `GET /api/admin/pending-ngos`
Lists NGOs awaiting document verification review.

### `POST /api/admin/verify-ngo/:ngoId`
Approves (`verified`) or rejects (`rejected`) NGO with feedback note.

### `GET /api/admin/users`
Lists all platform users.
