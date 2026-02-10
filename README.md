# simuNet FSM Portal

Comprehensive implementation report and requirement traceability for the multi-portal Field Service Management (FSM) system.

Last updated: February 10, 2026

## 1. Executive Summary

This repository currently contains a working **Phase 1 FSM prototype foundation** implemented as a single Next.js App Router application with three role-specific route zones:

- `/admin` for internal Company Supervisor workflows
- `/tech` for Technician mobile/offline-friendly workflows
- `/client` for Client Supervisor diary approvals and read-only status/packet access

The core workflow engine (job lifecycle states, diary approval loop, packet generation preconditions, basic audit events) is implemented and enforceable. The app is functional for demo and process validation, but still requires production integrations for Microsoft Graph, persistent database/storage, PDF merge generation, notifications, and enterprise-grade authentication.

## 2. Your Original Business Objective (Captured)

You requested a web-based FSM portal for a subcontracted telecom operations context (FTTH, ISP, IPLC), focused on:

- Teams-based job intake
- end-to-end maintenance and small-works lifecycle tracking
- technician evidence capture (mobile-first)
- diary drafting and client approval loops
- final packet generation and archival under Job ID
- auditability and reduced invoicing/payment cycle delays

You also specified one deployment and one auth stack with three role-zones:

- `/admin`
- `/tech`
- `/client`

## 3. What Was Built

### 3.1 Platform and Stack

- Next.js 15 App Router
- TypeScript strict mode
- React 19
- `pnpm` package manager
- Middleware route guarding by role
- In-memory seeded data store for workflow simulation

### 3.2 Route Zones Implemented

- `app/admin/*`
- `app/tech/*`
- `app/client/*`
- role mismatch redirect path: `app/unauthorized/page.tsx`

### 3.3 Shared Core Modules Implemented

- Types and domain entities: `types/domain.ts`
- RBAC permissions: `lib/rbac.ts`
- job scope enforcement: `lib/scope.ts`
- state machine/transition rules: `lib/state-machine.ts`
- seeded repository and workflow actions: `lib/mock-db.ts`
- API helpers and error handling: `lib/api-helpers.ts`

### 3.4 Shared Components Implemented

- timeline: `components/job-timeline.tsx`
- document list: `components/document-list.tsx`
- status badge/state visualization: `components/status-badge.tsx`
- approval/reject comment control: `components/comment-approval.tsx`
- upload queue UI: `components/upload-queue.tsx`

## 4. Requirement Traceability (What You Asked vs What Exists)

Status legend:

- `Implemented` = works in current app
- `Partial (Demo)` = present as simulation/stub, not production integration
- `Not Implemented` = missing

### 4.1 Business Context and Objective

| Requirement | Status | Notes |
|---|---|---|
| Telecom maintenance/small works process digitization | Implemented | Workflow and role portals modeled end-to-end in demo form |
| Phase 1 workflow coverage | Implemented | Intake, execution, diary validation, packet submission/archival states implemented |
| Payment reconciliation out of scope | Implemented | No finance reconciliation engine included |

### 4.2 Roles and Permissions (RBAC)

| Requirement | Status | Notes |
|---|---|---|
| Company Supervisor/Admin role | Implemented | Full control in `/admin` |
| Technician role | Implemented | Evidence + status workflow in `/tech` |
| Client Supervisor role | Implemented | Approval/read-only scope in `/client` |
| Role permission checks on requests | Implemented | Enforced in API handlers via `lib/rbac.ts` |
| Job scope checks on requests | Implemented | Enforced via `lib/scope.ts` and API guards |

### 4.3 Workflow Phase A: Job Intake (Teams)

| Requirement | Status | Notes |
|---|---|---|
| Teams intake channel | Partial (Demo) | Queue is simulated; no live Graph subscription/polling |
| Create Job ID from intake message | Implemented | `POST /api/teams/intake` creates Job + source docs |
| Store attachments against Job ID | Partial (Demo) | Metadata stored in memory; no real binary storage backend |
| Microsoft Graph API integration | Not Implemented | No Graph auth/webhook/pull currently |

### 4.4 Workflow Phase B: Supervisor Review/Approval

| Requirement | Status | Notes |
|---|---|---|
| Supervisor review of job card | Implemented | Intake + workspace views in admin portal |
| Digital sign/approve | Partial (Demo) | Approve action exists; no legal signature/certificate |
| Send approved job back to telecom rep | Partial (Demo) | Event log text indicates send; no outbound integration |
| Assign technicians | Implemented | Assignment action + state transition |
| SMS/WhatsApp technician notification | Partial (Demo) | Event says queued; no provider integration |

### 4.5 Workflow Phase C: Site Execution

| Requirement | Status | Notes |
|---|---|---|
| Technician performs site work | Implemented | Job details + status controls |
| Upload site photos/notes | Implemented | Evidence queue and sync endpoint |
| Update status to Site Work Complete | Implemented | Guarded status transition endpoints |

### 4.6 Workflow Phase D: Diary Drafting and Validation

| Requirement | Status | Notes |
|---|---|---|
| Supervisor drafts diary | Implemented | Admin workspace diary actions |
| Generate diary snippet PDF | Partial (Demo) | Creates diary document metadata, no real PDF binary generation |
| Send diary to telecom supervisor | Partial (Demo) | Status/events implemented; no external delivery integration |
| Reject -> edit -> resubmit loop | Implemented | `DIARY_SENT -> DIARY_PENDING -> DIARY_SENT` via approvals and edits |
| Approval locks specific diary version | Partial (Demo) | State moves to approved, but immutable version locking is not hard-enforced |

### 4.7 Workflow Phase E: Final Packet Generation

| Requirement | Status | Notes |
|---|---|---|
| Generate packet only after diary approval | Implemented | Hard precondition enforced |
| Maintenance packet components | Partial (Demo) | Required docs represented as metadata entries |
| Small works packet components incl. map/offer | Partial (Demo) | Types supported; composition is simulated |
| Merge documents into single PDF | Not Implemented | Final packet PDF creation is simulated as metadata |
| Permanent packet storage under Job ID | Partial (Demo) | Path metadata exists, no persistent object storage |

### 4.8 Workflow Phase F: Submission and Audit Trail

| Requirement | Status | Notes |
|---|---|---|
| Send final packet to client/authorities/finance | Partial (Demo) | Submission event is logged; no external dispatch adapters |
| Log timestamps and approvals for audit | Implemented | Events include actor + timestamps + metadata |

### 4.9 Document Management and Storage

| Requirement | Status | Notes |
|---|---|---|
| Centralized repository | Partial (Demo) | In-memory collection only |
| Indexed by Job ID/site/type/date | Implemented | Filters/search implemented in jobs/archive views |
| Multi-year retention | Not Implemented | No durable DB/object storage lifecycle yet |
| Fast retrieval | Partial (Demo) | Functional in-memory filters; not benchmarked on large datasets |

### 4.10 Technical Requirements

| Requirement | Status | Notes |
|---|---|---|
| Responsive web application | Implemented | Layout adapts across desktop/mobile |
| Mobile-friendly technician interface | Implemented | Dedicated `/tech` UX and controls |
| Offline-first technician behavior | Partial (Demo) | Local queue + SW cache; no robust background sync/conflict strategy |
| Cloud storage for images/PDFs | Not Implemented | Object paths are simulated |
| Secure auth + RBAC | Partial (Demo) | Cookie-based demo identity and RBAC, no enterprise IdP |
| PDF generation + merge | Not Implemented | Simulated document records only |
| Teams Graph API integration | Not Implemented | Not yet wired |

### 4.11 Definition of Done Alignment

| Definition of done item | Status | Notes |
|---|---|---|
| Jobs created directly from Teams | Partial (Demo) | Works from mock inbox API, not real Teams feed |
| Tech mobile evidence upload | Implemented | Queue, sync, status update flow operational |
| Single merged packet per job | Partial (Demo) | Packet record exists; true merged PDF not generated |
| Retrieve archived jobs years later in seconds | Not Implemented | Needs persistent DB + storage + indexing |

## 5. Portal-by-Portal Compliance Against Your Route-Zone Design

### 5.1 `/admin` Company Supervisor Portal

Implemented:

- Dashboard with pipeline counts by state
- Stuck jobs panel (idle threshold logic)
- Intake inbox from Teams queue simulation
- Jobs list with search and filters
- Job workspace with:
  - header summary
  - activity feed
  - document table with type/version/hash
  - diary info
  - audit log table
  - action panel for assignment, status, diary actions, packet actions
- Approvals page (pending client feedback and rejection loop visibility)
- Archive search and retrieval view

Gaps:

- Digital signature implementation
- outbound telecom/client authority notification integrations
- true binary file previews/downloads

### 5.2 `/tech` Technician Portal (PWA-oriented)

Implemented:

- My Jobs list scoped by assignment/scope
- Last sync indicator from local storage
- Job details with instructions/materials
- Status guardrails (In Progress, Site Work Complete)
- Camera-first evidence input (file capture attribute)
- Local event queue (`PENDING`, `SENT`, `CONFIRMED`, `FAILED`)
- Retry mechanism
- WhatsApp fallback deep-link with event IDs and payload text
- Queue view for all pending items
- Basic service worker and web app manifest

Gaps:

- Real media upload pipeline and binary transfer handling
- robust offline conflict resolution/reconciliation beyond basic status markers
- HQ WhatsApp ingestion + event reconciliation service

### 5.3 `/client` Client Supervisor Portal

Implemented:

- Diary approvals list
- Diary review page with approve/reject + comment
- Read-only job status table
- Final packet access section with permission-filtered visibility

Gaps:

- Diary PDF rendering from real stored files
- true packet file download (currently JSON demo route)

### 5.4 Screen-by-Screen Matrix (Your Navigation Checklist)

#### Admin portal checklist

| Requested item | Status | Current implementation |
|---|---|---|
| Dashboard pipeline counts by state | Implemented | `app/admin/page.tsx` |
| Stuck jobs panel | Implemented | `app/admin/page.tsx` |
| Intake inbox list from Teams | Implemented | `app/admin/inbox/page.tsx` + `components/admin/intake-inbox.tsx` |
| Attachment preview in intake | Partial (Demo) | Attachment names shown, no binary preview renderer |
| Create Job ID action | Implemented | `POST /api/teams/intake` |
| Approve Job action | Implemented | `POST /api/jobs/[jobId]/status` with `APPROVE` |
| Assign Techs action | Implemented | `POST /api/jobs/[jobId]/status` with `ASSIGN` |
| Jobs search and filters | Implemented | `app/admin/jobs/page.tsx` |
| Job workspace header | Implemented | `app/admin/jobs/[jobId]/page.tsx` |
| Activity feed | Implemented | `components/job-timeline.tsx` |
| Documents with types/versions/hashes | Implemented | `components/document-list.tsx` |
| Diary editor + generate PDF + send | Implemented (PDF is demo metadata) | `components/admin/job-workspace-actions.tsx` + diary API |
| Packet generator with prerequisite check | Implemented | `components/admin/job-workspace-actions.tsx` + packet API |
| Audit log view | Implemented | `app/admin/jobs/[jobId]/page.tsx` |
| Archive retrieval + audit trail view | Implemented | `app/admin/archive/page.tsx` |
| Export/download packet | Partial (Demo) | JSON export exists; real packet binary download not yet |

#### Technician portal checklist

| Requested item | Status | Current implementation |
|---|---|---|
| My Jobs list (cached) | Implemented | `app/tech/page.tsx` + local queue state |
| Last sync time indicator | Implemented | `components/tech/sync-indicator.tsx` |
| Job detail instructions/materials | Implemented | `app/tech/jobs/[jobId]/page.tsx` |
| Evidence checklist | Implemented | `app/tech/jobs/[jobId]/page.tsx` |
| Status buttons with guardrails | Implemented | `components/tech/status-controls.tsx` |
| Camera-first photo capture | Implemented | `capture=\"environment\"` in `components/tech/evidence-capture.tsx` |
| Add note | Implemented | `components/tech/evidence-capture.tsx` |
| Auto tag with Job ID + timestamp + technician | Implemented | Queue item carries `jobId`, `createdAt`, `technicianId` |
| Local event first (optimistic) | Implemented | Event queued in localStorage before sync |
| Upload queue states Pending/Sent/Confirmed | Implemented | `components/upload-queue.tsx` |
| Retry failed queue items | Implemented | `syncPending` and queue retry actions |
| WhatsApp fallback button | Implemented | `openWhatsAppFallback` |
| WhatsApp payload with `job_id` and `event_ids` | Implemented | Generated message text includes both |
| Include selected media in WhatsApp fallback | Partial (Demo) | Includes media filenames, not binary transfer |
| Reconciliation via `event_ids` after HQ ingest | Partial (Demo) | Client sends IDs; HQ ingest/reconciliation backend not implemented |

#### Client portal checklist

| Requested item | Status | Current implementation |
|---|---|---|
| Diary approvals list | Implemented | `app/client/page.tsx` |
| Status + timestamps | Implemented | Included in diary list table |
| Diary review screen | Implemented | `app/client/diaries/[jobId]/page.tsx` |
| View diary snippet PDF | Partial (Demo) | Document list shown; no inline PDF renderer from storage |
| Approve/reject with comment | Implemented | `components/comment-approval.tsx` + approvals API |
| Approve locks diary version | Partial (Demo) | Approval state exists; immutable version lock hardening pending |
| Optional read-only job status | Implemented | `app/client/page.tsx` |
| Final packet secure download | Partial (Demo) | Permission checks exist; download is JSON workspace payload |

### 5.5 Under-the-Hood Architecture Alignment (Your Target vs Current)

| Target architecture element | Status | Notes |
|---|---|---|
| Next.js app serves all portals | Implemented | Single app deployment model used |
| API layer enforces RBAC + state machine | Implemented | Route handlers enforce permission/scope and transition rules |
| Worker for PDF/Teams/WhatsApp/notifications/file processing | Not Implemented | No worker process or queue consumer yet |
| Postgres for metadata/events/approvals/audit | Not Implemented | In-memory store only |
| Object storage for files | Not Implemented | Paths and hashes are metadata only |
| Redis for queues/retries | Not Implemented | Local browser queue only |

## 6. Current State Machine and Guardrails

`RECEIVED -> APPROVED -> ASSIGNED -> IN_PROGRESS -> SITE_WORK_COMPLETE -> DIARY_PENDING -> DIARY_SENT -> DIARY_APPROVED -> PACKET_GENERATED -> SUBMITTED -> ARCHIVED`

Key guardrails implemented:

- invalid transitions rejected server-side
- packet generation blocked unless diary is approved
- reject flow returns status to `DIARY_PENDING`
- role permissions and job scope enforced before action execution

## 7. API Surface (Implemented)

### Auth/session demo

- `GET /api/auth/switch` switch demo user and set role cookie

### Jobs and workspace

- `GET /api/jobs`
- `GET /api/jobs/[jobId]`

### Intake and archive

- `GET /api/teams/intake`
- `POST /api/teams/intake`
- `GET /api/archive/search`

### Workflow actions

- `POST /api/jobs/[jobId]/status`
- `POST /api/jobs/[jobId]/events`
- `POST /api/jobs/[jobId]/diary`
- `POST /api/jobs/[jobId]/approvals`
- `POST /api/jobs/[jobId]/packet`

## 8. Security Model in This Build

What is enforced now:

- route-level role checks in `middleware.ts`
- API role permission checks via `lib/rbac.ts`
- API job-scope checks via `lib/scope.ts`

What is still required for production security:

- enterprise authentication (Entra ID/Auth0/Keycloak/etc.)
- server-side session hardening and token validation
- tenant-aware scoping strategy stored in DB
- audit log immutability strategy (append-only + signed records)

## 9. Data and Storage Reality Check

Current behavior:

- data is seeded and stored in `global.__simuNetDb` in process memory
- object paths and hashes are generated metadata only

Implication:

- data resets on server restart/redeploy
- no durable retention or true document archive yet

## 10. Local Run and Validation

### Requirements

- Node.js 20+
- `pnpm` (or `corepack pnpm`)

### Commands

```bash
corepack pnpm install
corepack pnpm dev
```

For quality checks:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

### Demo entry

Open `/` and use Quick Role Switch for:

- `Lee Supervisor` -> `/admin`
- `Ali Technician` / `Sam Technician` -> `/tech`
- `Maria Client Supervisor` -> `/client`

## 11. Gap Analysis (Critical)

### P0 gaps to close before production pilot

- real Microsoft Graph integration (Teams channels/messages/attachments)
- Postgres for metadata/events/workflow state
- object storage for files and signed download URLs
- true PDF generation and packet merge service
- real auth/SSO and hardened authorization
- notification adapters (SMS/WhatsApp/email)

### P1 gaps to close for audit/compliance readiness

- immutable audit log and event versioning
- strict diary version lock semantics and reapproval rules
- document checksum verification on upload/download
- retention policy + lifecycle controls

### P2 operational maturity

- observability: tracing, metrics, alerting
- retry dead-letter queues and admin replay tools
- backup/restore and disaster recovery procedures

## 12. Recommended Next Build Plan

1. Replace `lib/mock-db.ts` with repository layer backed by Postgres.
2. Add object storage integration (S3/Azure Blob) and upload/download endpoints.
3. Build a worker service for PDF generation, merge, and notifications.
4. Integrate Microsoft Graph for Teams ingestion with idempotent processing.
5. Implement real auth (Entra ID) and map users/roles/scopes from directory groups.
6. Implement WhatsApp fallback ingestion endpoint and queue reconciliation by `event_id`.
7. Add automated tests:
   - state transition unit tests
   - RBAC/scope authorization tests
   - API integration tests for every workflow action
8. Add migration scripts and seed scripts for environment parity.
9. Add role-specific analytics dashboards (turnaround time, rejection rate, packet SLA).
10. Harden archive retrieval with indexed search and benchmark targets.

## 13. Additional Product and Engineering Recommendations

- Define explicit SLA timers per workflow stage and display breach badges in admin.
- Add per-job prerequisite checklist logic before allowing transitions.
- Add document template version control for invoice and completion certificate formats.
- Introduce explicit distinction between system events and human approvals in audit UI.
- Add downloadable audit bundle per job for regulators.
- Add delegated client access expiration and emergency revocation controls.
- Add multilingual support if client and field teams use mixed languages.
- Add field media compression and optional EXIF redaction for privacy.
- Add time-to-payment KPIs tied to packet submission and client approval timestamps.
- Add background sync and conflict resolution policy for intermittent connectivity zones.

## 14. Honest Progress Statement

You asked for a multi-portal FSM system aligned to a telecom field operations process. That objective is **substantially modeled and navigable end-to-end in this repo**, with workflow logic, role-zoned UI, and audit-oriented eventing already in place.

The current build is best described as:

- **Strong functional prototype for process validation and UX/workflow alignment**
- **Not yet production-complete for real integrations, security hardening, and long-term archival guarantees**

That is exactly where the implementation currently stands versus your requirements.
