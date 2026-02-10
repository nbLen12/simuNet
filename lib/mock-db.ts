import { createHash } from "node:crypto";
import {
  assertTransition,
  isTransitionAllowed,
  statusRank
} from "@/lib/state-machine";
import type {
  ArchiveFilters,
  DiaryRecord,
  FinalPacket,
  Job,
  JobDocument,
  JobEvent,
  JobFilters,
  JobStatus,
  JobWorkspace,
  TeamsIntakeMessage,
  UserProfile
} from "@/types/domain";

interface Database {
  jobs: Job[];
  events: JobEvent[];
  documents: JobDocument[];
  diaries: DiaryRecord[];
  packets: FinalPacket[];
  intakeInbox: TeamsIntakeMessage[];
}

declare global {
  // eslint-disable-next-line no-var
  var __simuNetDb: Database | undefined;
}

function hash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function createSeedDatabase(): Database {
  const jobs: Job[] = [
    {
      id: "JOB-2026-0001",
      type: "MAINTENANCE",
      siteName: "North Exchange",
      clientReference: "TEL-66481",
      description: "Restore FTTH splice closure and verify last-mile signal quality.",
      requiredMaterials: ["Closure kit", "Fiber sleeves", "Cable ties"],
      status: "SITE_WORK_COMPLETE",
      assignedTechIds: ["tech_sam"],
      createdAt: minutesAgo(3200),
      updatedAt: minutesAgo(120),
      lastStateChangeAt: minutesAgo(180)
    },
    {
      id: "JOB-2026-0002",
      type: "SMALL_WORKS",
      siteName: "Hillcrest",
      clientReference: "TEL-66509",
      description: "Install additional fiber run and route map validation for new segment.",
      requiredMaterials: ["48-core cable", "Conduit", "Marker tape"],
      status: "DIARY_SENT",
      assignedTechIds: ["tech_ali"],
      createdAt: minutesAgo(5400),
      updatedAt: minutesAgo(35),
      lastStateChangeAt: minutesAgo(35)
    },
    {
      id: "JOB-2026-0003",
      type: "MAINTENANCE",
      siteName: "Riverbank",
      clientReference: "TEL-66533",
      description: "Repair damaged drop cable and replace weatherproof terminal box.",
      requiredMaterials: ["Drop cable", "Terminal box", "Fasteners"],
      status: "ASSIGNED",
      assignedTechIds: ["tech_ali"],
      createdAt: minutesAgo(1000),
      updatedAt: minutesAgo(250),
      lastStateChangeAt: minutesAgo(250)
    },
    {
      id: "JOB-2025-0914",
      type: "SMALL_WORKS",
      siteName: "Harbor",
      clientReference: "TEL-64021",
      description: "New duct route completion and client handover documentation.",
      requiredMaterials: ["Microduct", "Warning mesh", "Pull rope"],
      status: "ARCHIVED",
      assignedTechIds: ["tech_sam"],
      createdAt: minutesAgo(250000),
      updatedAt: minutesAgo(18000),
      lastStateChangeAt: minutesAgo(18000)
    }
  ];

  const documents: JobDocument[] = [
    {
      id: "DOC-1001",
      jobId: "JOB-2026-0001",
      type: "JOB_CARD",
      name: "job-card-JOB-2026-0001.pdf",
      objectPath: "jobs/JOB-2026-0001/job-card.pdf",
      sha256: hash("JOB-2026-0001-job-card"),
      version: 1,
      uploadedBy: "admin_lee",
      uploadedAt: minutesAgo(3190)
    },
    {
      id: "DOC-1002",
      jobId: "JOB-2026-0001",
      type: "SITE_PHOTO",
      name: "closure-repair-1.jpg",
      objectPath: "jobs/JOB-2026-0001/photos/closure-repair-1.jpg",
      sha256: hash("JOB-2026-0001-photo-1"),
      version: 1,
      uploadedBy: "tech_sam",
      uploadedAt: minutesAgo(240)
    },
    {
      id: "DOC-1003",
      jobId: "JOB-2026-0002",
      type: "JOB_OFFER",
      name: "job-offer-JOB-2026-0002.pdf",
      objectPath: "jobs/JOB-2026-0002/job-offer.pdf",
      sha256: hash("JOB-2026-0002-offer"),
      version: 1,
      uploadedBy: "admin_lee",
      uploadedAt: minutesAgo(5300)
    },
    {
      id: "DOC-1004",
      jobId: "JOB-2026-0002",
      type: "MAP_ROUTE",
      name: "route-map-JOB-2026-0002.pdf",
      objectPath: "jobs/JOB-2026-0002/route-map.pdf",
      sha256: hash("JOB-2026-0002-map"),
      version: 1,
      uploadedBy: "admin_lee",
      uploadedAt: minutesAgo(5300)
    },
    {
      id: "DOC-1005",
      jobId: "JOB-2026-0002",
      type: "DIARY_PDF",
      name: "diary-snippet-v1.pdf",
      objectPath: "jobs/JOB-2026-0002/diary-v1.pdf",
      sha256: hash("JOB-2026-0002-diary-v1"),
      version: 1,
      uploadedBy: "admin_lee",
      uploadedAt: minutesAgo(42)
    },
    {
      id: "DOC-2001",
      jobId: "JOB-2025-0914",
      type: "FINAL_PACKET",
      name: "final-packet-JOB-2025-0914.pdf",
      objectPath: "jobs/JOB-2025-0914/final-packet.pdf",
      sha256: hash("JOB-2025-0914-final-packet"),
      version: 1,
      uploadedBy: "admin_lee",
      uploadedAt: minutesAgo(18500)
    }
  ];

  const diaries: DiaryRecord[] = [
    {
      jobId: "JOB-2026-0002",
      version: 1,
      content:
        "Team completed route validation, installed 48-core segment, and performed OTDR verification. Minor conduit alignment corrected at chainage 3.2km.",
      status: "SENT",
      pdfDocumentId: "DOC-1005",
      lastEditedBy: "admin_lee",
      updatedAt: minutesAgo(42)
    }
  ];

  const packets: FinalPacket[] = [
    {
      jobId: "JOB-2025-0914",
      packetDocumentId: "DOC-2001",
      generatedAt: minutesAgo(18600),
      generatedBy: "admin_lee",
      submittedAt: minutesAgo(18590)
    }
  ];

  const events: JobEvent[] = [
    {
      id: "EV-001",
      jobId: "JOB-2026-0001",
      type: "JOB_RECEIVED",
      actorId: "admin_lee",
      actorName: "Lee Supervisor",
      message: "Job card ingested from Teams.",
      createdAt: minutesAgo(3190)
    },
    {
      id: "EV-002",
      jobId: "JOB-2026-0001",
      type: "TECH_ASSIGNED",
      actorId: "admin_lee",
      actorName: "Lee Supervisor",
      message: "Assigned technician Sam.",
      createdAt: minutesAgo(3100)
    },
    {
      id: "EV-003",
      jobId: "JOB-2026-0001",
      type: "EVIDENCE_UPLOADED",
      actorId: "tech_sam",
      actorName: "Sam Technician",
      message: "Uploaded photos and completion notes.",
      createdAt: minutesAgo(240)
    },
    {
      id: "EV-004",
      jobId: "JOB-2026-0002",
      type: "DIARY_SENT",
      actorId: "admin_lee",
      actorName: "Lee Supervisor",
      message: "Diary snippet v1 sent to client for review.",
      createdAt: minutesAgo(35)
    },
    {
      id: "EV-005",
      jobId: "JOB-2025-0914",
      type: "PACKET_SUBMITTED",
      actorId: "admin_lee",
      actorName: "Lee Supervisor",
      message: "Final packet submitted to finance and authority contacts.",
      createdAt: minutesAgo(18590)
    }
  ];

  const intakeInbox: TeamsIntakeMessage[] = [
    {
      id: "MSG-901",
      sourceChannel: "Teams / NOC Intake",
      siteName: "Oakridge",
      type: "MAINTENANCE",
      description: "Patch cable replacement and signal recovery at cabinet OAK-17.",
      materials: ["Patch cable", "Label kit"],
      mapIncluded: false,
      attachments: ["oakridge-job-card.pdf", "materials-list.xlsx"],
      receivedAt: minutesAgo(22)
    },
    {
      id: "MSG-902",
      sourceChannel: "Teams / Projects",
      siteName: "Midtown",
      type: "SMALL_WORKS",
      description: "New spur route extension toward business park.",
      materials: ["96-core cable", "Splice tray", "Route markers"],
      mapIncluded: true,
      attachments: ["midtown-offer.pdf", "midtown-route-map.pdf"],
      receivedAt: minutesAgo(11)
    }
  ];

  return { jobs, documents, events, diaries, packets, intakeInbox };
}

function db(): Database {
  if (!global.__simuNetDb) {
    global.__simuNetDb = createSeedDatabase();
  }

  return global.__simuNetDb;
}

function nextDocumentId(): string {
  const number = db().documents.length + 1001;
  return `DOC-${number}`;
}

function nextEventId(): string {
  const number = db().events.length + 1;
  return `EV-${String(number).padStart(3, "0")}`;
}

function nextJobId(): string {
  const max = db()
    .jobs.filter((job) => job.id.startsWith("JOB-2026-"))
    .map((job) => Number(job.id.split("-").at(-1) ?? "0"))
    .reduce((highest, current) => (current > highest ? current : highest), 0);

  return `JOB-2026-${String(max + 1).padStart(4, "0")}`;
}

function touchJob(job: Job): void {
  const now = nowIso();
  job.updatedAt = now;
  job.lastStateChangeAt = now;
}

function addEvent(
  jobId: string,
  actor: Pick<UserProfile, "id" | "name">,
  type: JobEvent["type"],
  message: string,
  metadata?: Record<string, string | number | boolean | null>
): JobEvent {
  const event: JobEvent = {
    id: nextEventId(),
    jobId,
    type,
    actorId: actor.id,
    actorName: actor.name,
    message,
    createdAt: nowIso(),
    metadata
  };
  db().events.push(event);

  return event;
}

function addDocument(
  input: Omit<JobDocument, "id" | "sha256" | "uploadedAt">
): JobDocument {
  const document: JobDocument = {
    ...input,
    id: nextDocumentId(),
    sha256: hash(`${input.jobId}-${input.type}-${input.name}-${Date.now()}`),
    uploadedAt: nowIso()
  };
  db().documents.push(document);

  return document;
}

export function listJobs(filters: JobFilters = {}): Job[] {
  const query = filters.q?.trim().toLowerCase();

  return db().jobs
    .filter((job) => {
      if (filters.status && job.status !== filters.status) {
        return false;
      }

      if (filters.type && job.type !== filters.type) {
        return false;
      }

      if (filters.assignedTechId && !job.assignedTechIds.includes(filters.assignedTechId)) {
        return false;
      }

      if (filters.site && !job.siteName.toLowerCase().includes(filters.site.toLowerCase())) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        job.id.toLowerCase().includes(query) ||
        job.siteName.toLowerCase().includes(query) ||
        job.clientReference.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.id.localeCompare(b.id));
}

export function getJob(jobId: string): Job | undefined {
  return db().jobs.find((job) => job.id === jobId);
}

export function getJobWorkspace(jobId: string): JobWorkspace | undefined {
  const job = getJob(jobId);
  if (!job) {
    return undefined;
  }

  const events = db()
    .events.filter((event) => event.jobId === jobId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const documents = db()
    .documents.filter((document) => document.jobId === jobId)
    .sort((a, b) => b.version - a.version || a.type.localeCompare(b.type));

  const diary = db().diaries.find((item) => item.jobId === jobId);
  const packet = db().packets.find((item) => item.jobId === jobId);

  return {
    job,
    events,
    documents,
    diary,
    packet
  };
}

export function listTeamsInbox(): TeamsIntakeMessage[] {
  return db()
    .intakeInbox.filter((message) => !message.processedJobId)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function createJobFromTeamsMessage(messageId: string, actor: UserProfile): Job {
  const message = db().intakeInbox.find((item) => item.id === messageId);
  if (!message) {
    throw new Error(`Intake message ${messageId} not found`);
  }

  if (message.processedJobId) {
    const existing = getJob(message.processedJobId);
    if (!existing) {
      throw new Error(`Processed job ${message.processedJobId} missing`);
    }

    return existing;
  }

  const now = nowIso();
  const jobId = nextJobId();
  const newJob: Job = {
    id: jobId,
    type: message.type,
    siteName: message.siteName,
    clientReference: `TEL-${Math.floor(60000 + Math.random() * 9999)}`,
    description: message.description,
    requiredMaterials: message.materials,
    status: "RECEIVED",
    assignedTechIds: [],
    createdAt: now,
    updatedAt: now,
    lastStateChangeAt: now
  };

  db().jobs.push(newJob);
  message.processedJobId = newJob.id;

  addDocument({
    jobId,
    type: message.type === "SMALL_WORKS" ? "JOB_OFFER" : "JOB_CARD",
    name: message.attachments[0] ?? `job-source-${message.id}.pdf`,
    objectPath: `jobs/${jobId}/source/${message.attachments[0] ?? "source.pdf"}`,
    version: 1,
    uploadedBy: actor.id
  });

  if (message.mapIncluded) {
    addDocument({
      jobId,
      type: "MAP_ROUTE",
      name: message.attachments.find((file) => file.includes("map")) ?? "route-map.pdf",
      objectPath: `jobs/${jobId}/source/route-map.pdf`,
      version: 1,
      uploadedBy: actor.id
    });
  }

  addEvent(newJob.id, actor, "JOB_RECEIVED", `Job created from Teams message ${message.id}`);

  return newJob;
}

export function getPipelineCounts(): Record<JobStatus, number> {
  return db().jobs.reduce<Record<JobStatus, number>>(
    (acc, job) => {
      acc[job.status] += 1;
      return acc;
    },
    {
      RECEIVED: 0,
      APPROVED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      SITE_WORK_COMPLETE: 0,
      DIARY_PENDING: 0,
      DIARY_SENT: 0,
      DIARY_APPROVED: 0,
      PACKET_GENERATED: 0,
      SUBMITTED: 0,
      ARCHIVED: 0
    }
  );
}

export function listStuckJobs(maxIdleMinutes = 180): Job[] {
  const now = Date.now();

  return db().jobs
    .filter((job) => {
      if (["ARCHIVED", "SUBMITTED"].includes(job.status)) {
        return false;
      }

      const minutesIdle = (now - new Date(job.lastStateChangeAt).getTime()) / (1000 * 60);
      return minutesIdle >= maxIdleMinutes;
    })
    .sort(
      (a, b) =>
        new Date(a.lastStateChangeAt).getTime() - new Date(b.lastStateChangeAt).getTime()
    );
}

export function approveJob(jobId: string, actor: UserProfile): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  assertTransition(job.status, "APPROVED");
  job.status = "APPROVED";
  touchJob(job);

  addEvent(job.id, actor, "JOB_APPROVED", "Job card approved and acknowledged.");

  return job;
}

export function assignTechnicians(jobId: string, techIds: string[], actor: UserProfile): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status === "APPROVED") {
    assertTransition("APPROVED", "ASSIGNED");
    job.status = "ASSIGNED";
  }

  job.assignedTechIds = Array.from(new Set(techIds));
  touchJob(job);

  addEvent(
    job.id,
    actor,
    "TECH_ASSIGNED",
    `Technicians assigned: ${job.assignedTechIds.join(", ") || "none"}. Notification queued.`
  );

  return job;
}

export function setJobStatus(
  jobId: string,
  status: JobStatus,
  actor: UserProfile,
  message?: string
): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status !== status) {
    assertTransition(job.status, status);
    job.status = status;
    touchJob(job);
  }

  addEvent(
    job.id,
    actor,
    "STATUS_CHANGED",
    message ?? `Status updated to ${status.replaceAll("_", " ").toLowerCase()}.`
  );

  return job;
}

export function addEvidence(
  jobId: string,
  actor: UserProfile,
  input: { note?: string; photoName?: string }
): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (isTransitionAllowed(job.status, "IN_PROGRESS") && job.status === "ASSIGNED") {
    job.status = "IN_PROGRESS";
    touchJob(job);
  }

  if (input.photoName) {
    addDocument({
      jobId,
      type: "SITE_PHOTO",
      name: input.photoName,
      objectPath: `jobs/${jobId}/evidence/${input.photoName}`,
      version: 1,
      uploadedBy: actor.id
    });
  }

  if (input.note) {
    addDocument({
      jobId,
      type: "SITE_NOTE",
      name: `note-${Date.now()}.txt`,
      objectPath: `jobs/${jobId}/evidence/note-${Date.now()}.txt`,
      version: 1,
      uploadedBy: actor.id
    });
  }

  addEvent(
    jobId,
    actor,
    "EVIDENCE_UPLOADED",
    `Evidence uploaded${input.note ? `: ${input.note}` : ""}`,
    {
      hasPhoto: Boolean(input.photoName)
    }
  );

  return job;
}

export function upsertDiary(jobId: string, actor: UserProfile, content: string): DiaryRecord {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status === "SITE_WORK_COMPLETE") {
    assertTransition("SITE_WORK_COMPLETE", "DIARY_PENDING");
    job.status = "DIARY_PENDING";
    touchJob(job);
  }

  const current = db().diaries.find((item) => item.jobId === jobId);

  const nextVersion = current ? current.version + 1 : 1;
  const next: DiaryRecord = {
    jobId,
    version: nextVersion,
    content,
    status: "DRAFT",
    lastEditedBy: actor.id,
    reviewerComment: current?.reviewerComment,
    reviewerId: current?.reviewerId,
    updatedAt: nowIso()
  };

  if (current) {
    const index = db().diaries.indexOf(current);
    db().diaries[index] = next;
  } else {
    db().diaries.push(next);
  }

  addEvent(jobId, actor, "DIARY_UPDATED", `Diary updated to version ${nextVersion}.`);

  return next;
}

export function generateDiaryPdf(jobId: string, actor: UserProfile): JobDocument {
  const diary = db().diaries.find((item) => item.jobId === jobId);
  if (!diary) {
    throw new Error(`Diary for ${jobId} not found`);
  }

  const pdf = addDocument({
    jobId,
    type: "DIARY_PDF",
    name: `diary-snippet-v${diary.version}.pdf`,
    objectPath: `jobs/${jobId}/diary/diary-snippet-v${diary.version}.pdf`,
    version: diary.version,
    uploadedBy: actor.id
  });

  diary.pdfDocumentId = pdf.id;
  diary.updatedAt = nowIso();

  addEvent(jobId, actor, "DIARY_UPDATED", `Diary PDF generated for version ${diary.version}.`);

  return pdf;
}

export function sendDiary(jobId: string, actor: UserProfile): DiaryRecord {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const diary = db().diaries.find((item) => item.jobId === jobId);
  if (!diary) {
    throw new Error(`Diary for ${jobId} missing`);
  }

  if (!diary.pdfDocumentId) {
    throw new Error("Diary PDF must be generated before sending.");
  }

  if (job.status !== "DIARY_SENT") {
    assertTransition(job.status, "DIARY_SENT");
    job.status = "DIARY_SENT";
    touchJob(job);
  }

  diary.status = "SENT";
  diary.updatedAt = nowIso();

  addEvent(jobId, actor, "DIARY_SENT", `Diary version ${diary.version} sent to client.`);

  return diary;
}

export function reviewDiary(
  jobId: string,
  actor: UserProfile,
  decision: "APPROVE" | "REJECT",
  comment?: string
): DiaryRecord {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const diary = db().diaries.find((item) => item.jobId === jobId);
  if (!diary) {
    throw new Error(`Diary for ${jobId} missing`);
  }

  diary.reviewerId = actor.id;
  diary.reviewerComment = comment;
  diary.updatedAt = nowIso();

  if (decision === "APPROVE") {
    assertTransition(job.status, "DIARY_APPROVED");
    job.status = "DIARY_APPROVED";
    diary.status = "APPROVED";
    addEvent(jobId, actor, "DIARY_REVIEWED", "Diary approved by client supervisor.", {
      comment: comment ?? null
    });
  } else {
    assertTransition(job.status, "DIARY_PENDING");
    job.status = "DIARY_PENDING";
    diary.status = "REJECTED";
    addEvent(jobId, actor, "DIARY_REVIEWED", "Diary rejected and returned for edits.", {
      comment: comment ?? null
    });
  }

  touchJob(job);

  return diary;
}

function ensurePacketPrerequisites(job: Job): void {
  if (job.status !== "DIARY_APPROVED") {
    throw new Error("Final packet can only be generated after diary approval.");
  }
}

export function generateFinalPacket(jobId: string, actor: UserProfile): FinalPacket {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  ensurePacketPrerequisites(job);

  addDocument({
    jobId,
    type: "INVOICE",
    name: `invoice-${jobId}.pdf`,
    objectPath: `jobs/${jobId}/packet/invoice-${jobId}.pdf`,
    version: 1,
    uploadedBy: actor.id
  });

  addDocument({
    jobId,
    type: "COMPLETION_CERTIFICATE",
    name: `completion-certificate-${jobId}.pdf`,
    objectPath: `jobs/${jobId}/packet/completion-certificate-${jobId}.pdf`,
    version: 1,
    uploadedBy: actor.id
  });

  const packetDocument = addDocument({
    jobId,
    type: "FINAL_PACKET",
    name: `final-packet-${jobId}.pdf`,
    objectPath: `jobs/${jobId}/packet/final-packet-${jobId}.pdf`,
    version: 1,
    uploadedBy: actor.id
  });

  assertTransition(job.status, "PACKET_GENERATED");
  job.status = "PACKET_GENERATED";
  touchJob(job);

  const packet: FinalPacket = {
    jobId,
    packetDocumentId: packetDocument.id,
    generatedAt: nowIso(),
    generatedBy: actor.id
  };

  const existing = db().packets.find((item) => item.jobId === jobId);
  if (existing) {
    const index = db().packets.indexOf(existing);
    db().packets[index] = packet;
  } else {
    db().packets.push(packet);
  }

  addEvent(jobId, actor, "PACKET_GENERATED", "Final packet generated and archived.");

  return packet;
}

export function submitFinalPacket(jobId: string, actor: UserProfile): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  assertTransition(job.status, "SUBMITTED");
  job.status = "SUBMITTED";
  touchJob(job);

  const packet = db().packets.find((item) => item.jobId === jobId);
  if (packet) {
    packet.submittedAt = nowIso();
  }

  addEvent(
    jobId,
    actor,
    "PACKET_SUBMITTED",
    "Final packet submitted to client supervisor, authorities, and finance."
  );

  return job;
}

export function archiveJob(jobId: string, actor: UserProfile): Job {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  assertTransition(job.status, "ARCHIVED");
  job.status = "ARCHIVED";
  touchJob(job);

  addEvent(jobId, actor, "JOB_ARCHIVED", "Job and documents archived for long-term retention.");

  return job;
}

export function listPendingDiaryApprovals(): Array<{
  job: Job;
  diary: DiaryRecord;
}> {
  return db()
    .diaries.filter((diary) => diary.status === "SENT")
    .map((diary) => {
      const job = getJob(diary.jobId);
      if (!job) {
        return undefined;
      }

      return { job, diary };
    })
    .filter((item): item is { job: Job; diary: DiaryRecord } => Boolean(item))
    .sort((a, b) => new Date(b.diary.updatedAt).getTime() - new Date(a.diary.updatedAt).getTime());
}

export function searchArchive(filters: ArchiveFilters = {}): Job[] {
  return db()
    .jobs.filter((job) => ["PACKET_GENERATED", "SUBMITTED", "ARCHIVED"].includes(job.status))
    .filter((job) => {
      if (filters.jobId && !job.id.includes(filters.jobId)) {
        return false;
      }

      if (filters.siteName && !job.siteName.toLowerCase().includes(filters.siteName.toLowerCase())) {
        return false;
      }

      if (filters.type && job.type !== filters.type) {
        return false;
      }

      if (filters.dateFrom && new Date(job.updatedAt) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && new Date(job.updatedAt) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getJobDocuments(jobId: string): JobDocument[] {
  return db()
    .documents.filter((document) => document.jobId === jobId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}
