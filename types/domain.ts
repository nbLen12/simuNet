export type PortalRole = "ADMIN" | "TECH" | "CLIENT";

export type JobType = "MAINTENANCE" | "SMALL_WORKS";

export type JobStatus =
  | "RECEIVED"
  | "APPROVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SITE_WORK_COMPLETE"
  | "DIARY_PENDING"
  | "DIARY_SENT"
  | "DIARY_APPROVED"
  | "PACKET_GENERATED"
  | "SUBMITTED"
  | "ARCHIVED";

export type DocumentType =
  | "JOB_CARD"
  | "JOB_OFFER"
  | "MATERIALS_LIST"
  | "MAP_ROUTE"
  | "SITE_PHOTO"
  | "SITE_NOTE"
  | "DIARY_PDF"
  | "INVOICE"
  | "COMPLETION_CERTIFICATE"
  | "FINAL_PACKET";

export type EventType =
  | "JOB_RECEIVED"
  | "JOB_APPROVED"
  | "TECH_ASSIGNED"
  | "STATUS_CHANGED"
  | "EVIDENCE_UPLOADED"
  | "DIARY_UPDATED"
  | "DIARY_SENT"
  | "DIARY_REVIEWED"
  | "PACKET_GENERATED"
  | "PACKET_SUBMITTED"
  | "JOB_ARCHIVED"
  | "SYSTEM_NOTE";

export interface UserScope {
  sites: string[];
  explicitJobIds: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: PortalRole;
  phone?: string;
  scope: UserScope;
}

export interface Job {
  id: string;
  type: JobType;
  siteName: string;
  clientReference: string;
  description: string;
  requiredMaterials: string[];
  status: JobStatus;
  assignedTechIds: string[];
  createdAt: string;
  updatedAt: string;
  lastStateChangeAt: string;
}

export interface JobDocument {
  id: string;
  jobId: string;
  type: DocumentType;
  name: string;
  objectPath: string;
  sha256: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface JobEvent {
  id: string;
  jobId: string;
  type: EventType;
  actorId: string;
  actorName: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface DiaryRecord {
  jobId: string;
  version: number;
  content: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  pdfDocumentId?: string;
  lastEditedBy: string;
  reviewerId?: string;
  reviewerComment?: string;
  updatedAt: string;
}

export interface FinalPacket {
  jobId: string;
  packetDocumentId: string;
  generatedAt: string;
  generatedBy: string;
  submittedAt?: string;
}

export interface TeamsIntakeMessage {
  id: string;
  sourceChannel: string;
  siteName: string;
  type: JobType;
  description: string;
  materials: string[];
  mapIncluded: boolean;
  attachments: string[];
  receivedAt: string;
  processedJobId?: string;
}

export interface JobWorkspace {
  job: Job;
  events: JobEvent[];
  documents: JobDocument[];
  diary?: DiaryRecord;
  packet?: FinalPacket;
}

export interface JobFilters {
  q?: string;
  status?: JobStatus;
  type?: JobType;
  assignedTechId?: string;
  site?: string;
}

export interface ArchiveFilters {
  jobId?: string;
  siteName?: string;
  type?: JobType;
  dateFrom?: string;
  dateTo?: string;
}
