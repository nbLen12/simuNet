# simuNet FSM Portal

Field Service Management (FSM) web system for telecom subcontractor operations, implemented as a single Next.js application with role-based portals, workflow state enforcement, document tracking, approvals, and audit event logging.

---

## 1) System Scope

The system models a Phase 1 operational workflow for:
- Job intake (Teams intake simulation via API)
- Job assignment and execution tracking
- Technician evidence capture and job updates
- Diary drafting and client approval loop
- Final packet generation gating and submission logging
- Search and retrieval views for archived jobs

Out of scope:
- Payment reconciliation and finance-side workflows

---

## 2) Portals (Route Zones)

The application is a single deployment with three role-zoned portal routes:

- `/admin` — Company Supervisor portal
- `/tech` — Technician portal (mobile-oriented, offline queue)
- `/client` — Client Supervisor portal (diary approvals + read-only views)

Route mismatch handling:
- `/unauthorized`

---

## 3) Workflow Model

### 3.1 Job State Machine

The workflow state machine is enforced server-side:

`RECEIVED -> APPROVED -> ASSIGNED -> IN_PROGRESS -> SITE_WORK_COMPLETE -> DIARY_PENDING -> DIARY_SENT -> DIARY_APPROVED -> PACKET_GENERATED -> SUBMITTED -> ARCHIVED`

Guardrails implemented:
- Invalid transitions rejected server-side
- Packet generation blocked unless diary is approved
- Rejection flow returns job to `DIARY_PENDING`
- Role permission checks and job scope checks enforced before actions execute

### 3.2 Role Summary

- Company Supervisor (Admin)
  - Job acceptance/approval
  - Technician assignment
  - Diary drafting and send for approval
  - Packet generation and submission logging
  - Archive search and retrieval

- Technician
  - View assigned jobs
  - Capture evidence (photos, notes) into local queue
  - Sync queued updates to server
  - Update job status (including Site Work Complete)
  - WhatsApp fallback deep link for queued updates (message payload includes job_id and event_ids)

- Client Supervisor
  - Review diaries and approve/reject with comment
  - View job status (read-only)
  - View packet section (access controlled)

---

## 4) Platform and Stack

- Next.js 15 App Router
- TypeScript (strict)
- React 19
- pnpm package manager
- Middleware route guarding by role
- In-memory seeded data store (workflow simulation)

---

## 5) Repository Structure (Key Paths)

### 5.1 Route Zones
- `app/admin/*`
- `app/tech/*`
- `app/client/*`
- `app/unauthorized/page.tsx`

### 5.2 Shared Core Modules
- Domain types/entities: `types/domain.ts`
- RBAC permissions: `lib/rbac.ts`
- Job scope enforcement: `lib/scope.ts`
- Workflow transition rules: `lib/state-machine.ts`
- Seeded repository + workflow actions: `lib/mock-db.ts`
- API helpers + error handling: `lib/api-helpers.ts`

### 5.3 Shared Components
- Timeline: `components/job-timeline.tsx`
- Document list: `components/document-list.tsx`
- Status visualization: `components/status-badge.tsx`
- Approval/reject with comment: `components/comment-approval.tsx`
- Upload queue UI: `components/upload-queue.tsx`

---

## 6) Portal Features

### 6.1 `/admin` Company Supervisor Portal
Includes:
- Dashboard pipeline counts by workflow state
- Stuck jobs panel (idle threshold logic)
- Intake inbox from Teams queue simulation
- Jobs list with search/filters
- Job workspace:
  - header summary
  - activity feed
  - documents table (type/version/hash)
  - diary actions
  - audit log view
  - action panel for assignment/status/diary/packet actions
- Approvals page (pending client feedback + rejection loop visibility)
- Archive search and retrieval view

### 6.2 `/tech` Technician Portal
Includes:
- Assigned jobs list scoped by assignment/scope
- Last sync indicator (local)
- Job details with instructions/materials
- Status controls with transition guardrails
- Evidence capture input (camera-first file capture attribute)
- Local queue states: `PENDING`, `SENT`, `CONFIRMED`, `FAILED`
- Retry mechanism for failed queue items
- WhatsApp fallback deep link (payload includes `job_id` and `event_ids`)
- Service worker and web app manifest (basic PWA scaffolding)

### 6.3 `/client` Client Supervisor Portal
Includes:
- Diary approvals list
- Diary review page with approve/reject + comment
- Read-only job status table
- Final packet section with permission-filtered visibility

---

## 7) API Surface (Implemented)

### 7.1 Auth/session demo
- `GET /api/auth/switch` — switch demo user and set role cookie

### 7.2 Jobs and workspace
- `GET /api/jobs`
- `GET /api/jobs/[jobId]`

### 7.3 Intake and archive
- `GET /api/teams/intake`
- `POST /api/teams/intake`
- `GET /api/archive/search`

### 7.4 Workflow actions
- `POST /api/jobs/[jobId]/status`
- `POST /api/jobs/[jobId]/events`
- `POST /api/jobs/[jobId]/diary`
- `POST /api/jobs/[jobId]/approvals`
- `POST /api/jobs/[jobId]/packet`

---

## 8) Security Controls (Current Build)

Enforced:
- Route-level role checks in `middleware.ts`
- API role permission checks via `lib/rbac.ts`
- API job-scope checks via `lib/scope.ts`

---

## 9) Data and Storage (Current Build)

Current behavior:
- Data is seeded and stored in process memory (`global.__simuNetDb`)
- Document paths and hashes exist as metadata entries

Implications:
- Data resets on server restart/redeploy
- Binary storage backend is not configured in this build

---

## 10) Local Run

### Requirements
- Node.js 20+
- pnpm (or `corepack pnpm`)

### Install and run
```bash
corepack pnpm install
corepack pnpm dev
