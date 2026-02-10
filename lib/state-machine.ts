import type { JobStatus } from "@/types/domain";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  RECEIVED: "Received",
  APPROVED: "Approved",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SITE_WORK_COMPLETE: "Site Work Complete",
  DIARY_PENDING: "Diary Pending",
  DIARY_SENT: "Diary Sent",
  DIARY_APPROVED: "Diary Approved",
  PACKET_GENERATED: "Packet Generated",
  SUBMITTED: "Submitted",
  ARCHIVED: "Archived"
};

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  RECEIVED: ["APPROVED"],
  APPROVED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS", "SITE_WORK_COMPLETE"],
  IN_PROGRESS: ["SITE_WORK_COMPLETE"],
  SITE_WORK_COMPLETE: ["DIARY_PENDING"],
  DIARY_PENDING: ["DIARY_SENT"],
  DIARY_SENT: ["DIARY_PENDING", "DIARY_APPROVED"],
  DIARY_APPROVED: ["PACKET_GENERATED"],
  PACKET_GENERATED: ["SUBMITTED"],
  SUBMITTED: ["ARCHIVED"],
  ARCHIVED: []
};

export function isTransitionAllowed(from: JobStatus, to: JobStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!isTransitionAllowed(from, to)) {
    throw new Error(`Invalid state transition ${from} -> ${to}`);
  }
}

export function statusRank(status: JobStatus): number {
  const order: JobStatus[] = [
    "RECEIVED",
    "APPROVED",
    "ASSIGNED",
    "IN_PROGRESS",
    "SITE_WORK_COMPLETE",
    "DIARY_PENDING",
    "DIARY_SENT",
    "DIARY_APPROVED",
    "PACKET_GENERATED",
    "SUBMITTED",
    "ARCHIVED"
  ];

  return order.indexOf(status);
}
