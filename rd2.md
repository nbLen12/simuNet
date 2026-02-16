# simuNet FSM Portal (Telecom Subcontractor Field Service Management)

**What this system is (human version):**  
This is a **job-to-payment-document pipeline** for a telecom subcontractor.  
A telecom (the “Client”) sends a job. Your company does the work in the field. You collect proof. You write the diary. The client approves it. You generate an invoice/certificate packet. You submit it. You archive it for audits.

**What this system is NOT:**  
It is not an ISP subscriber portal (routers, customer billing plans, usage graphs). It’s an **operations + documents + approvals + audit** platform.

Last updated: February 10, 2026 :contentReference[oaicite:3]{index=3}

---

## 0) Glossary (so we stop speaking in fog)

**Company** = the subcontractor (you / the business running this portal).  
**Client** = the Telecommunications Company that hires the Company.  
**Company Supervisor (Admin)** = internal “workflow owner” for jobs (the person ensuring completeness, approvals, and submission).  
**Technician** = field worker capturing evidence and updating job progress.  
**Client Supervisor** = the Client’s person who approves diaries and sometimes checks job status.

**Job Card / Job Offer** = the Client’s instruction pack (description, materials, map/route for small works).  
**Diary** = the narrative record of what was done (usually required before the Client accepts invoicing).  
**Completion Certificate** = a “work completed” document tied to job reference/site.  
**Invoice** = billing document from the Company to the Client.  
**Final Packet** = the **single merged PDF bundle** the Company submits for the Client’s finance/audit process (invoice + certificate + job card/offer + map/route + other required docs).

---

## 1) Executive Summary (repo reality)

This repository currently contains a working **Phase 1 FSM prototype foundation** implemented as a single Next.js App Router application with three role-specific route zones:

- `/admin` for internal Company Supervisor workflows  
- `/tech` for Technician mobile/offline-friendly workflows  
- `/client` for Client Supervisor diary approvals and read-only status/packet access :contentReference[oaicite:4]{index=4}

The core workflow engine (job lifecycle states, diary approval loop, packet generation preconditions, basic audit events) is implemented and enforceable. The app is functional for demo and process validation, but still requires production integrations for Microsoft Graph, persistent database/storage, PDF merge generation, notifications, and enterprise-grade authentication. :contentReference[oaicite:5]{index=5}

---

## 2) Real-world “day in the life” examples (so the system makes sense)

### Example A — Maintenance Job (FTTH fault repair)
1. Client posts a **job card** in Teams:  
   “No service. Cabinet C-14. Replace damaged drop cable. Materials list attached.”
2. Supervisor opens **Intake Inbox** → creates a Job ID → approves/accepts the job → assigns Technician Ali.
3. Technician goes to site:
   - takes photos (before/after)
   - adds notes (“found cut at pole P8, replaced 20m cable, spliced 2 cores”)
   - marks **Site Work Complete**
4. Supervisor checks evidence, writes diary (short narrative), generates **Diary PDF**, sends to Client Supervisor.
5. Client Supervisor approves diary.
6. Supervisor clicks **Generate Final Packet**:
   - invoice + completion certificate + original job card (and diary PDF if required)
   - merges into one PDF and archives under Job ID
7. Supervisor submits packet to client finance and logs submission.
8. Years later, audit asks “show job C-14 for 2026-02.” You retrieve in seconds.

### Example B — Small Works Job (new route / extension)
1. Client posts **job offer** + **route map** + materials.
2. Supervisor accepts job and assigns technicians.
3. Technicians perform installation, upload evidence along the route.
4. Supervisor drafts diary and gets Client approval.
5. Final packet includes:
   - invoice
   - completion certificate
   - route map
   - original job offer/card
   - (optional) evidence summary
6. Submit + archive + audit trail.

This is why the portal is mainly about **workflow control + document evidence + approvals + archive**, not “router dashboards”.

---

## 3) The three portals (one system, three doors)

### 3.1 `/admin` — Company Supervisor Portal (internal HQ command center)
This portal exists the way a supervisor actually works:

- Intake jobs (from Teams)
- Decide “accept/reject/need more info”
- Assign technicians
- Ensure evidence completeness
- Draft diary, handle rejection loops, secure approval
- Generate packet, submit, archive
- Track delays (jobs stuck in states)
- Survive audits

Your README already lists the admin screens and what exists in the prototype (dashboard, inbox, job workspace, approvals view, archive). :contentReference[oaicite:6]{index=6}

### 3.2 `/tech` — Technician Portal (mobile-first, offline-first)
Technicians need:
- assigned jobs list
- job details
- camera-first evidence capture
- notes
- status updates with guardrails
- offline queue with retries
- WhatsApp fallback (user-invoked) when the portal sync is failing

Prototype implements the queue states and WhatsApp fallback deep link with event IDs. :contentReference[oaicite:7]{index=7} :contentReference[oaicite:8]{index=8}

### 3.3 `/client` — Client Supervisor Portal (external, minimal surface)
External users should have minimal access:
- diary approvals (approve/reject + comment)
- optionally job status read-only
- final packet access (download) when available

Prototype includes diary approvals and review with approve/reject. :contentReference[oaicite:9]{index=9}

---

## 4) The “Admin is workflow owner” (plain-language meaning)

The Company Supervisor is responsible for **moving each job through the pipeline** in a way that:
1) satisfies the Client’s operational expectations (correct job, correct scope)  
2) satisfies the Client’s finance process (correct reference, correct invoice)  
3) satisfies audit requirements (proof + approvals + traceability)  
4) reduces cycle time (less waiting = faster payment)

**Concrete admin responsibilities:**
- Intake quality: job card exists, scope is clear, attachments are present
- Assignment: right technician(s), right timeline
- Evidence gate: don’t draft diary if evidence is missing
- Diary gate: don’t generate packet if diary isn’t approved
- Packet correctness: ensure required docs are included and correct versions are merged
- Submission: ensure packet is dispatched, and the system can prove it was dispatched
- Audit safety: ensure nothing “mysteriously changes” after approval (versioning + locking)

If the admin role is done badly, the Company loses money:
- diaries get rejected repeatedly
- packets get submitted incomplete
- invoices are delayed
- audits become painful

That’s the real meaning behind the “command center” phrasing.

---

## 5) Workflow: end-to-end phases (A → F) with fallbacks & edge cases

### Phase A — Job Intake (Teams → Job ID)
**Goal:** convert a Teams message + attachments into a Job record with source documents stored.

**Normal flow:**
1) Client posts job card in Teams channel/message.
2) System ingests the message (Graph integration in production; simulated in prototype). :contentReference[oaicite:10]{index=10}
3) System creates Job ID and stores attachments as Documents under that Job.

**Fallbacks:**
- If Graph permissions are blocked/delayed: admin uses a “Manual Intake” screen:
  - copy key fields
  - upload the attachments manually
  - link them to the Job ID
- If attachments are missing: admin flags job as “Needs Info” and requests missing map/materials list.

**Edge cases:**
- duplicate Teams post (same job posted twice): intake must be idempotent (same external message ID → same job or dedupe prompt).
- edited Teams message: system should treat the initial stored copy as truth, and optionally store “updated version” as a new document version.

### Phase B — Supervisor Review & Approval
**Goal:** accept the job, sign/approve it (in workflow terms), assign technicians, notify them.

**Normal flow:**
1) Admin opens job card.
2) Admin approves/accepts job → state moves forward.
3) Admin assigns technician(s).
4) Technician gets a notification with a secure job link (SMS/WhatsApp/Teams).

**Fallbacks:**
- if notifications fail: admin can copy link manually or send via Teams/WhatsApp directly.
- if a technician is unavailable: reassign and log reassignment.

**Important clarity: “digital signature”**
In Phase 1, “signature” usually means “approval event recorded (user+timestamp)”. A legal e-signature is a separate, heavier feature and should be explicitly requested.

Prototype currently implements approval action but not a legal signature. :contentReference[oaicite:11]{index=11} :contentReference[oaicite:12]{index=12}

### Phase C — Site Execution (technician work + evidence capture)
**Goal:** field updates become **Job Events** + Documents, even under poor connectivity.

**Normal flow:**
1) Tech opens assigned job in `/tech`.
2) Tech captures evidence:
   - photos
   - notes
   - optional structured fields (materials used, time started/finished)
3) Tech updates status (“In Progress”, “Site Work Complete”).

**Offline-first rule (always):**
- Every tech action writes to a **local queue immediately** (optimistic UI).
- Queue items have `event_id` for dedupe/reconciliation.
- UI shows `PENDING / SENT / CONFIRMED / FAILED`. :contentReference[oaicite:13]{index=13}

**Fallback 1: retry sync**
- app retries sending queued items when connectivity returns.

**Fallback 2: WhatsApp (user-invoked alternate submission channel)**
- If sync fails repeatedly, technician can choose:
  “Send queued updates via WhatsApp”
- WhatsApp message includes:
  - Job ID
  - event_ids
  - minimal text summary
  - selected media
- HQ side receives and ingests into the system (production integration).

Prototype includes WhatsApp fallback payload with job_id and event_ids (binary transfer not yet implemented). :contentReference[oaicite:14]{index=14}

**Edge cases (must be designed):**
- duplicate uploads: event_id makes server idempotent
- conflicting edits: server keeps both as separate versions/events; never silently overwrites history
- huge photos: client-side compression and EXIF stripping (privacy + bandwidth)
- wrong job ID in WhatsApp message: ingestion rejects and notifies admin

### Phase D — Diary Drafting & Client Validation
**Goal:** turn evidence into a client-acceptable narrative (Diary) and lock approval.

**Normal flow:**
1) Tech marks Site Work Complete.
2) Admin receives notification/visibility.
3) Admin checks evidence completeness (minimum checklist).
4) Admin drafts diary (human narrative).
5) System generates Diary PDF snippet.
6) Diary PDF is sent to Client Supervisor for approval.
7) Client Supervisor:
   - approves (locks diary version)
   - or rejects with comment → admin edits → resubmits

Prototype has the rejection loop transitions and diary workflow behavior. :contentReference[oaicite:15]{index=15}

**Diary “lock” semantics (production rule):**
- Approval must lock a **specific version** of the diary document.
- If edits are needed after approval, system creates a **new version** and requires re-approval.

Prototype notes that immutable version locking is not yet hard-enforced. :contentReference[oaicite:16]{index=16}

### Phase E — Final Packet Generation (per job type)
**Goal:** after diary approval, generate the merged PDF packet, store it permanently, and make it retrievable.

**Normal flow:**
1) Admin clicks “Generate Final Packet”
2) System confirms preconditions:
   - diary approved
   - job card exists
   - map exists for small works
   - required docs exist
3) System generates:
   - Invoice PDF
   - Completion Certificate PDF
4) System merges required documents into a single PDF:
   - **Maintenance:** invoice + certificate + job card (and optionally diary)
   - **Small Works:** invoice + certificate + map/route + job offer/card
5) System stores final packet under Job ID and records:
   - doc hash/checksum
   - composition list (which documents + versions were merged)

Prototype enforces “packet generation blocked unless diary approved”. :contentReference[oaicite:17]{index=17}  
Prototype does not yet implement real PDF merge. :contentReference[oaicite:18]{index=18}

**Fallbacks:**
- if PDF generation fails, admin sees a clear error and can retry; the job stays in “ready but not generated” state.
- if specific doc missing, system lists exactly what’s missing.

### Phase F — Submission & Audit Trail
**Goal:** dispatch packet to defined recipients and log “who/when/what”.

**Normal flow:**
1) Admin selects recipient set:
   - Client Supervisor
   - Client Finance
   - (optional) authorities
2) System sends secure link or email with attachment (policy choice).
3) System records submission event.

Prototype logs submission event but no outbound integration yet. :contentReference[oaicite:19]{index=19}

**Fallbacks:**
- if dispatch integration is down, admin can manually download and send; system supports “mark as submitted manually” with reason.

**Audit requirement:**
- Every approval and submission must be traceable (actor + timestamp + referenced doc version).

---

## 6) State machine (what states exist and what transitions are allowed)

Current implemented workflow state machine (prototype):  
`RECEIVED -> APPROVED -> ASSIGNED -> IN_PROGRESS -> SITE_WORK_COMPLETE -> DIARY_PENDING -> DIARY_SENT -> DIARY_APPROVED -> PACKET_GENERATED -> SUBMITTED -> ARCHIVED` :contentReference[oaicite:20]{index=20}

### Transition rules (production-grade intent)
Each transition must define:
- **Who can trigger** it (role + permission)
- **Preconditions** (required docs/events)
- **Side effects** (create audit event, queue background jobs, notify recipients)
- **Failure behavior** (why it fails, what UI shows, what retry looks like)

Examples:
- `DIARY_SENT` only allowed if diary draft exists and evidence checklist passes
- `PACKET_GENERATED` only allowed if diary approved AND required docs exist per job type
- `SUBMITTED` only allowed if packet exists

---

## 7) Documents: types, lifecycle, versioning, and storage rules

### 7.1 Document types (typical Phase 1 set)
- SOURCE documents (from client):
  - Job Card / Job Offer
  - Map / Route (small works)
- FIELD evidence:
  - Photos
  - Notes (as events; optionally exported to PDF later)
- GENERATED documents:
  - Diary PDF (draft)
  - Diary PDF (approved/locked)
  - Invoice PDF
  - Completion Certificate PDF
  - Final Packet PDF (merged)

### 7.2 Versioning rules (audit-safe)
- Any change to a client-facing document creates a new version.
- Approval references:
  - document id
  - version
  - hash
- Approved versions are immutable.
- Final packet references exact source versions used.

### 7.3 Storage rules (production target)
- Object storage for binaries (photos/PDFs)
- Database for metadata and indexes:
  - job_id, site, date, job_type, doc_type, version, hash, created_by

Prototype currently stores metadata in-memory only and resets on restart. :contentReference[oaicite:21]{index=21}

---

## 8) Audit trail (what gets logged, always)

An audit log entry should exist for:
- job created (and from which Teams message)
- job approved/accepted
- technicians assigned/unassigned
- status changes
- evidence received (including source: portal sync vs WhatsApp)
- diary generated
- diary sent to client
- diary approved/rejected (with comments)
- packet generated (with composition details)
- packet submitted (recipient set)
- manual overrides (“marked submitted manually because…”)

Prototype already logs timestamps/approvals as events. :contentReference[oaicite:22]{index=22}

---

## 9) Integrations (and what happens when they fail)

### 9.1 Microsoft Teams / Microsoft Graph (production)
**Goal:** ingest job cards and attachments from Teams.

Implementation approaches:
- webhook subscription (preferred where possible)
- scheduled polling worker (fallback)

Idempotency:
- Teams message ID should map to a single intake record
- duplicate notifications should not create duplicate jobs

Failure handling:
- ingestion errors go to a retry queue
- admin can still manually intake

Prototype currently simulates Teams intake; Graph integration not implemented. :contentReference[oaicite:23]{index=23}

### 9.2 Notifications (SMS / WhatsApp / Email / Teams)
Best practice:
- notifications send links, not sensitive attachments
- delivery status is logged (sent/failed/retried)

Fallback:
- manual send allowed, but must be logged (“manual dispatch done by X”)

Prototype has placeholders for SMS/WhatsApp notifications. :contentReference[oaicite:24]{index=24}

### 9.3 WhatsApp fallback ingestion (HQ side)
**Goal:** accept technician-submitted updates when portal sync is unreliable.

Rules:
- Only accept inbound from whitelisted technician numbers
- Must validate technician is assigned to job
- Must require Job ID and event_ids in message text
- Media is downloaded, stored as documents, linked to events
- Event reconciliation uses event_ids to avoid duplicates

Prototype notes HQ ingestion is not yet implemented. :contentReference[oaicite:25]{index=25}

---

## 10) Security model (what “secure” means here)

### 10.1 Authentication
Production goal:
- enterprise auth (Entra ID / SSO) for internal users
- external client users either:
  - Entra B2B guest, or
  - dedicated external accounts + MFA

Prototype uses demo session switching. :contentReference[oaicite:26]{index=26}

### 10.2 Authorization (RBAC + job scope)
Every request must enforce:
- role permission (can you do this action)
- job scope (are you allowed on this job)

Prototype enforces role checks and job scope in middleware and API guards. :contentReference[oaicite:27]{index=27}

### 10.3 File security
Production requirements:
- signed download URLs
- virus/malware scanning on upload
- hash verification on stored files

---

## 11) Performance & “retrieve in seconds”
To meet “multi-year retrieval within seconds”:
- database indexes on job_id, site, job_type, date, status
- object storage with predictable keys
- archive view optimized for filters

Prototype has functional filtering in-memory but does not yet guarantee performance at scale. :contentReference[oaicite:28]{index=28}

---

## 12) Current implementation status (prototype vs production readiness)

### 12.1 Stack (current)
- Next.js 15 App Router
- TypeScript strict mode
- React 19
- pnpm
- middleware route guarding
- in-memory seeded store :contentReference[oaicite:29]{index=29}

### 12.2 Current limitation
- data resets on redeploy/restart
- no durable storage archive yet :contentReference[oaicite:30]{index=30}

---

## 13) API surface (prototype)
Implemented endpoints include:
- `GET /api/jobs`, `GET /api/jobs/[jobId]`
- `GET /api/teams/intake`, `POST /api/teams/intake`
- `POST /api/jobs/[jobId]/status`
- `POST /api/jobs/[jobId]/events`
- `POST /api/jobs/[jobId]/diary`
- `POST /api/jobs/[jobId]/approvals`
- `POST /api/jobs/[jobId]/packet` :contentReference[oaicite:31]{index=31}

---

## 14) Running locally (prototype)
Requirements:
- Node.js 20+
- pnpm/corepack :contentReference[oaicite:32]{index=32}

Commands:
```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
``` :contentReference[oaicite:33]{index=33}

Demo roles:
- Lee Supervisor → `/admin`
- Ali/Sam Technician → `/tech`
- Maria Client Supervisor → `/client` :contentReference[oaicite:34]{index=34}

---

## 15) Gaps & roadmap (what must be added for production)

### P0 (production pilot blockers)
- Microsoft Graph Teams ingestion
- Postgres for metadata/events/workflow state
- Object storage for files + signed URLs
- Real PDF generation + merge
- Real auth/SSO + hardened authorization
- Notification adapters :contentReference[oaicite:35]{index=35}

### P1 (audit/compliance readiness)
- immutable audit log strategy
- strict diary version lock semantics + reapproval rules
- checksum verification upload/download
- retention policy + lifecycle controls :contentReference[oaicite:36]{index=36}

### P2 (operational maturity)
- observability (metrics/logs/traces)
- dead-letter queues + replay tools
- backup/restore + disaster recovery procedures :contentReference[oaicite:37]{index=37}

---

## 16) Design principles (to keep the system sane)
1) The portal is the system of record; chat tools are ingestion/notification channels.
2) Every state transition must be guarded by prerequisites.
3) Every client-facing approval locks a specific document version.
4) Every action creates an audit event.
5) Offline-first is mandatory; WhatsApp fallback is optional but supported (user-invoked).
6) No silent overwrites; version everything that matters.

---

## 17) Why this exists (business value)
- fewer delays between completion and invoicing
- fewer rejections due to missing evidence/docs
- faster submission to finance
- audit readiness without panic

---

## 18) Honest progress statement
This repo is a strong process-validation prototype: the role-zoned portal structure, workflow logic, and demo UX are modeled end-to-end, but production integrations and durable storage/security are still required. :contentReference[oaicite:38]{index=38}
