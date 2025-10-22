## i-Dentity System Design (Beginner Friendly / Interview Ready)

> Purpose: A collaborative platform connecting dental clinics with partner labs to manage restorative / orthodontic cases, share 3D STL files, track production progress, and exchange feedback.

---

### 1. High‑Level Goals
1. Clinics can create cases, upload dental model files (STL), select / let labs accept them.
2. Labs accept cases, update production status, upload derived design files, and deliver results.
3. Both parties see real‑time(ish) status, history, messages, and can review each other.
4. Secure file handling using cloud storage (Cloudinary) – no large binaries in DB.
5. Geolocation & distance ranking so clinics pick nearby labs (lower turnaround). 
6. Simple, stateless auth (JWT) to keep API scalable and deployment friendly (Vercel serverless). 
7. Beginner approachable code: Next.js App Router + Prisma + Postgres.

---

### 2. Primary Actors & Use Cases
| Actor | Main Actions |
|-------|--------------|
| Clinic User | Register, create case, upload files, view labs (map), monitor status, message lab, review after delivery, favorite labs |
| Lab User | Register, view unassigned cases, accept/reject, update status (DESIGNING → READY → DISPATCHED → DELIVERED), upload design files, message clinic |
| System | Sends password reset codes, signs Cloudinary uploads, enforces role access, stores audit history |

---

### 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                Client (Next.js)                        │
│  - React pages/components (App Router)                                 │
│  - Fetch API routes (JWT in Authorization header)                      │
│  - Direct signed uploads to Cloudinary                                 │
│  - Leaflet map (labs + distance)                                       │
│  - Three.js STL viewer (dynamic import)                                │
└───────────────▲────────────────────────────────────────────────────────┘
                │ HTTP (JSON) / Direct Upload HTTPS
┌───────────────┴────────────────────────────────────────────────────────┐
│                        Next.js API Routes (Server)                     │
│  Auth: login, register, logout, request-reset, reset-password          │
│  Case: create, accept/reject, status updates, cancel, fetch details    │
│  Files: signature (Cloudinary), metadata persistence                   │
│  User/Profile: clinic / lab dashboards, favorites, me                  │
│  Middleware: JWT verification, role guards                             │
└───────────────▲────────────────────────────────────────────────────────┘
                │ Prisma (SQL queries)
┌───────────────┴────────────────────────────────────────────────────────┐
│                         PostgreSQL (Neon serverless)                   │
│  Tables: User, Clinic, Lab, Case, File, Message, Review, FavoriteLab,  │
│          PasswordResetToken                                           │
└───────────────▲────────────────────────────────────────────────────────┘
                │ Web API (Upload) / CDN delivery
┌───────────────┴────────────────────────┐   ┌──────────────────────────┐
│            Cloudinary                  │   │       Resend / SMTP      │
│  - Signed direct uploads (STL, etc.)   │   │  - Password reset email  │
│  - Stores URL returned to backend      │   │  - Future notifications   │
└────────────────────────────────────────┘   └──────────────────────────┘
```

Why Serverless Friendly: Each API route is isolated, stateless (JWT), and only needs DB + environment secrets.

---

### 4. Tech Choices (Interview Justifications)
| Concern | Selected | Rationale |
|---------|----------|-----------|
| UI/SSR | Next.js App Router | Hybrid SSR + API co-location, easy deploy to Vercel |
| Styling | Tailwind CSS | Rapid iteration, consistent dark “glass” theme |
| DB | Postgres (Neon) | Relational integrity (cases, files, reviews) + serverless scaling |
| ORM | Prisma | Developer productivity, type safety, migrations |
| Auth | JWT | Stateless, simple horizontal scaling, no session store |
| 3D | Three.js STL loader | Viewer for dental scans |
| Maps | Leaflet + OSM | Free, no key, light footprint |
| Files | Cloudinary direct signed upload | Offloads bandwidth; transformation/CDN caching |
| Email | Resend (API) / fallback SMTP | Easy transactional email API |
| Geocode | Nominatim OSM | Free geocoding for address to lat/lon |

---

### 5. Data Model (Simplified Explanation)
Refer to `prisma/schema.prisma` – main relationships:
- User (role: CLINIC | LAB) 1–1 → Clinic or Lab profile.
- Clinic 1–N Cases; Lab 1–N Cases.
- Case 1–N Files (original + design outputs), 1–N Messages, optional 1 Review.
- FavoriteLab is a join (Clinic ↔ Lab) for quick favorites list.
- PasswordResetToken stores temporary OTP per email.
- Status history stored as JSON array for flexible evolution (avoids extra table initially).

Case Lifecycle (happy path): NEW → ACCEPTED → DESIGNING → READY → DISPATCHED → DELIVERED (+ review) or CANCELLED / REJECTED off‑ramps.

---

### 6. Key Flows

#### 6.1 Registration
1. User submits name, email, password, role, profile details (address etc.).
2. Server hashes password (bcrypt), creates User + role profile inside a transaction.
3. If address provided, server geocodes (Nominatim) → stores latitude/longitude.
4. Returns JWT for immediate login (optional pattern).

#### 6.2 Authentication (Login)
1. User sends email/password → server verifies hash.
2. Issues JWT (payload: user id, role). Stored in `localStorage` client side.
3. All protected API calls include `Authorization: Bearer <token>`.
4. Middleware (`authenticateToken` / `requireClinic` / `requireLab`) parses + validates.

#### 6.3 Case Creation & File Upload
1. Clinic enters case metadata.
2. Client requests signed upload parameters from `/api/files/signature` (JWT required).
3. Client uploads STL (and other files) directly to Cloudinary (bypasses Next.js server bandwidth).
4. On success, Cloudinary returns `secure_url`, `public_id`.
5. Client calls backend endpoint to persist File record (filename, size, url, caseId). 
6. Case remains NEW until a lab accepts.

#### 6.4 Case Acceptance
1. Lab lists unassigned NEW cases (filter: `labId == null`).
2. POST `/api/case/{id}/accept` with action=accept.
3. Atomic DB update ensures only the first lab wins (where clause includes `labId: null, status: NEW`).
4. Status becomes ACCEPTED; labId set.

#### 6.5 Status Progression
PATCH `/api/case/{id}/status` enforces allowed transitions, appends an entry to JSON `statusHistory` for audit/trace UI.

#### 6.6 Messaging (Simplified Pull Model)
Messages stored in `Message` table; client polls (or could upgrade to WebSocket / SSE later).

#### 6.7 Reviews
After DELIVERED, clinic can submit one Review (Case → unique review). Aggregated ratings can update Lab rating average (future aggregation job or real‑time update).

#### 6.8 Password Reset (OTP)
1. User requests reset → system generates 6‑digit OTP, stores row with expiry (15 min) & throttle (if existing <60s old, silently returns).
2. Sends email via Resend API (or SMTP fallback) with code.
3. User submits email + OTP + new password → server validates & updates password, deletes token.
4. (Future) Increment `tokenVersion` to invalidate old JWTs.

#### 6.9 Geolocation & Distance Sorting
1. When clinics view labs, client has clinic coordinates (from stored profile or browser geolocation fallback).
2. Distance computed client or server using Haversine formula.
3. UI filters (e.g., within X km) & sorts ascending to highlight nearest labs.

---

### 7. Security Considerations
Implemented:
- Password hashing (bcrypt).
- JWT authorization guards per route (role checks).
- Signed uploads (prevents arbitrary uploads to your Cloudinary cloud).
- Avoids email existence disclosure (generic reset response).
- Basic rate throttle for reset requests.

Planned / Recommended Enhancements:
- Token versioning for post‑reset JWT invalidation.
- Hash OTP codes (store hashed; compare using bcrypt) to protect at-rest.
- Add indexes (e.g., on `Case.status`, `Case.labId`, `FavoriteLab.clinicId` for faster dashboards).
- WebSocket / SSE for real-time messages instead of polling.
- Central audit log for sensitive changes.
- Soft deletion (deleted flag) for compliance.

---

### 8. Performance & Scalability
Early Stage (Current):
- Pagination (cases list) keeps responses small.
- Offloaded large file traffic to Cloudinary CDN.
- Serverless friendly: each request hits shortest path (JWT decode, Prisma query). 

Future Scaling Steps:
- Introduce caching layer (e.g., Redis) for lab lists / geospatial queries.
- Move statusHistory to separate `CaseStatusEvent` table for efficient querying & analytics.
- Add background workers (BullMQ / serverless cron) for email digests or rating recalculations.
- Introduce search indexes (pg_trgm) for textual lab search.

---

### 9. Trade‑Offs & Rationale
| Decision | Pros | Cons | Mitigation |
|----------|------|------|-----------|
| Store statusHistory as JSON | Fast to implement, flexible | Harder to query aggregate stats | Migrate to events table later |
| Direct Cloudinary upload | Saves server bandwidth, faster UX | Slightly more client complexity (signature step) | Encapsulated helper endpoint |
| JWT stateless auth | Horizontal scale, simple | Hard to revoke | Add tokenVersion / blacklist if needed |
| Single Review per Case | Simplifies rating | No multi-step feedback | Could add ReviewComments table |
| Polling messages | Simple | Inefficient at scale | Upgrade to WebSocket/SSE |

---

### 10. Failure Scenarios & Handling
| Scenario | Handling Today | Future Improvement |
|----------|----------------|--------------------|
| Cloudinary upload fails | Client shows error; user retries | Retry w/ exponential backoff, queued offline uploads |
| Race: multiple labs accept | Atomic WHERE clause fails losers | Add optimistic UI hint |
| Password reset spam | 60s throttle per email | Global IP rate limit + CAPTCHA |
| Token theft | User can reset password | Add device sessions + token versioning |
| Geocode API down | Returns null coords | Queue retry & user notification |

---

### 11. Example Sequence: Clinic Creates Case & Lab Delivers
```
Clinic → (JWT) POST /api/case/create  → DB row NEW
Clinic → signed request /api/files/signature → Cloudinary upload → /api/files/cloudinary metadata save
Lab List → GET /api/cases?status=NEW (unassigned) → shows case
Lab → POST /api/case/{id}/accept action=accept → status ACCEPTED
Lab → PATCH /api/case/{id}/status DESIGNING → history append
Lab → PATCH /api/case/{id}/status READY → ...
Lab → PATCH /api/case/{id}/status DISPATCHED → ...
Lab → PATCH /api/case/{id}/status DELIVERED → final
Clinic → POST /api/review (caseId) → rating updates
```

---

### 12. Interview Talking Points (Cheat Sheet)
- Chose Cloudinary to decouple file throughput & enable CDN/transformations.
- Signed upload pattern: backend generates timestamp + signature; client uploads directly.
- Status transitions enforced server-side (finite state machine lite) to preserve integrity.
- JSON statusHistory for rapid iteration; migration path to normalized events.
- Leaflet chosen for free base maps; distance ordering via Haversine; potential move to PostGIS.
- Security roadmap demonstrates forward thinking (token versioning, OTP hashing, rate limiting).
- Designed for incremental real-time upgrade (polling → WebSocket) without rewriting domain logic.

---

### 13. Future Extensions
- Multi-file versioning & diff comments (per STL iteration).
- Automatic STL validation / preview generation worker.
- Push notifications / email digests for status changes.
- Multi-tenancy (org table, role scoping).
- Analytics dashboard (turnaround times, acceptance rates, quality metrics).
- PostGIS or elastic geo index for advanced location queries.

---

### 14. Quick Glossary (Beginner Friendly)
| Term | Meaning |
|------|---------|
| JWT | JSON Web Token, signed token carrying user identity & role |
| Prisma | ORM that maps JS/TS objects to SQL tables |
| CDN | Content Delivery Network, speeds file delivery globally |
| Signed Upload | Server gives a short-lived signature so client can upload safely |
| Haversine | Formula to compute distance between two lat/lon points |
| ORM Migration | Versioned change to DB schema |
| Stateless | Server does not store session info; each request is self-contained |

---

### 15. “If I Had More Time” (Nice Closing Statement)
I would introduce token versioning for revocation, normalize status events, add WebSocket messaging, implement hashed OTP storage, move distance queries to PostGIS, and add automated STL quality checks via a worker pipeline.

---

Feel free to tailor/remove depth depending on interviewer seniority. This document balances clarity for beginners with enough architectural intent for technical interviews.
