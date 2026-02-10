"use client";

import { useMemo, useState } from "react";
import type { JobStatus } from "@/types/domain";

const TRANSITION_OPTIONS: JobStatus[] = [
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

export function JobWorkspaceActions({
  jobId,
  currentStatus,
  assignedTechIds
}: {
  jobId: string;
  currentStatus: JobStatus;
  assignedTechIds: string[];
}): React.ReactElement {
  const [status, setStatus] = useState<JobStatus>(currentStatus);
  const [techIds, setTechIds] = useState(assignedTechIds.join(","));
  const [diary, setDiary] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGeneratePacket = useMemo(() => currentStatus === "DIARY_APPROVED", [currentStatus]);

  async function callApi(path: string, body: Record<string, unknown>, label: string): Promise<void> {
    setBusy(label);
    setError(null);

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `Action ${label} failed`);
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card">
      <h3>Workspace Actions</h3>
      <div className="grid cols-2">
        <article className="card">
          <h4 style={{ marginTop: 0 }}>Assign Technicians</h4>
          <label htmlFor="tech-ids">Technician IDs (comma separated)</label>
          <input
            id="tech-ids"
            value={techIds}
            onChange={(event) => setTechIds(event.target.value)}
            placeholder="tech_ali,tech_sam"
          />
          <div style={{ marginTop: "0.6rem" }}>
            <button
              onClick={() =>
                callApi(`/api/jobs/${jobId}/status`, {
                  action: "ASSIGN",
                  techIds: techIds
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                }, "assign")
              }
              disabled={busy !== null}
            >
              {busy === "assign" ? "Assigning..." : "Assign"}
            </button>
          </div>
        </article>

        <article className="card">
          <h4 style={{ marginTop: 0 }}>Status Transition</h4>
          <label htmlFor="status-select">Next status</label>
          <select
            id="status-select"
            value={status}
            onChange={(event) => setStatus(event.target.value as JobStatus)}
          >
            {TRANSITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div style={{ marginTop: "0.6rem" }}>
            <button
              className="secondary"
              onClick={() =>
                callApi(`/api/jobs/${jobId}/status`, { action: "SET_STATUS", status }, "status")
              }
              disabled={busy !== null}
            >
              {busy === "status" ? "Updating..." : "Update Status"}
            </button>
          </div>
        </article>

        <article className="card">
          <h4 style={{ marginTop: 0 }}>Diary Editor</h4>
          <textarea
            rows={5}
            value={diary}
            onChange={(event) => setDiary(event.target.value)}
            placeholder="Draft diary narrative summary"
          />
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            <button
              className="secondary"
              onClick={() => callApi(`/api/jobs/${jobId}/diary`, { action: "SAVE_DRAFT", diary }, "save-diary")}
              disabled={busy !== null}
            >
              Save Draft
            </button>
            <button
              className="secondary"
              onClick={() => callApi(`/api/jobs/${jobId}/diary`, { action: "GENERATE_PDF" }, "pdf")}
              disabled={busy !== null}
            >
              Generate Diary PDF
            </button>
            <button
              onClick={() => callApi(`/api/jobs/${jobId}/diary`, { action: "SEND" }, "send-diary")}
              disabled={busy !== null}
            >
              Send to Client
            </button>
          </div>
        </article>

        <article className="card">
          <h4 style={{ marginTop: 0 }}>Final Packet</h4>
          <p className="meta">Enabled only when diary is approved and locked.</p>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            <button
              onClick={() => callApi(`/api/jobs/${jobId}/packet`, { action: "GENERATE" }, "packet")}
              disabled={!canGeneratePacket || busy !== null}
            >
              Generate Final Packet
            </button>
            <button
              className="secondary"
              onClick={() => callApi(`/api/jobs/${jobId}/packet`, { action: "SUBMIT" }, "submit-packet")}
              disabled={busy !== null}
            >
              Submit Packet
            </button>
            <button
              className="ghost"
              onClick={() => callApi(`/api/jobs/${jobId}/packet`, { action: "ARCHIVE" }, "archive")}
              disabled={busy !== null}
            >
              Archive Job
            </button>
          </div>
        </article>
      </div>

      {error ? (
        <p className="warning" style={{ marginTop: "0.6rem" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
