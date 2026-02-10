"use client";

import { useState } from "react";
import type { JobStatus } from "@/types/domain";

export function StatusControls({
  jobId,
  currentStatus
}: {
  jobId: string;
  currentStatus: JobStatus;
}): React.ReactElement {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(action: "START_WORK" | "SITE_COMPLETE"): Promise<void> {
    setBusy(action);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Status update failed");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setBusy(null);
    }
  }

  const canStart = currentStatus === "ASSIGNED" || currentStatus === "IN_PROGRESS";
  const canComplete = currentStatus === "IN_PROGRESS" || currentStatus === "ASSIGNED";

  return (
    <section className="card">
      <h3>Status Controls</h3>
      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
        <button disabled={!canStart || busy !== null} onClick={() => update("START_WORK")}>
          {busy === "START_WORK" ? "Updating..." : "In Progress"}
        </button>
        <button
          className="secondary"
          disabled={!canComplete || busy !== null}
          onClick={() => update("SITE_COMPLETE")}
        >
          {busy === "SITE_COMPLETE" ? "Updating..." : "Site Work Complete"}
        </button>
      </div>

      {error ? (
        <p className="warning" style={{ marginTop: "0.6rem" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
