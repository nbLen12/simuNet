import { JOB_STATUS_LABELS } from "@/lib/state-machine";
import type { JobStatus } from "@/types/domain";

const STATUS_COLORS: Record<JobStatus, { fg: string; bg: string; border: string }> = {
  RECEIVED: { fg: "#0f4c81", bg: "#e8f2ff", border: "#bdd8ff" },
  APPROVED: { fg: "#185d3b", bg: "#e8fff3", border: "#b6f0d3" },
  ASSIGNED: { fg: "#6c4400", bg: "#fff4dd", border: "#f7d9a2" },
  IN_PROGRESS: { fg: "#8c3f0a", bg: "#fff0e6", border: "#f6c8a9" },
  SITE_WORK_COMPLETE: { fg: "#205f87", bg: "#e7f6ff", border: "#b7e2fb" },
  DIARY_PENDING: { fg: "#6d5610", bg: "#fff8df", border: "#f0de95" },
  DIARY_SENT: { fg: "#66309f", bg: "#f3eaff", border: "#dac4f8" },
  DIARY_APPROVED: { fg: "#0e6a3f", bg: "#e4ffef", border: "#afe4c7" },
  PACKET_GENERATED: { fg: "#0b5d67", bg: "#e3fbfe", border: "#afe4eb" },
  SUBMITTED: { fg: "#0c4f6b", bg: "#e2f3ff", border: "#b6dbf3" },
  ARCHIVED: { fg: "#505b6d", bg: "#eef2f8", border: "#d2dbe8" }
};

export function StatusBadge({ status }: { status: JobStatus }): React.ReactElement {
  const palette = STATUS_COLORS[status];

  return (
    <span
      className="pill"
      style={{
        color: palette.fg,
        background: palette.bg,
        borderColor: palette.border
      }}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
