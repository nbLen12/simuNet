"use client";

import Link from "next/link";
import { useState } from "react";
import type { TeamsIntakeMessage } from "@/types/domain";

export function IntakeInbox({
  messages
}: {
  messages: TeamsIntakeMessage[];
}): React.ReactElement {
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [createdJobs, setCreatedJobs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function createJob(messageId: string): Promise<void> {
    setBusyMessage(messageId);
    setError(null);

    try {
      const response = await fetch("/api/teams/intake", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ messageId })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Create Job ID failed");
      }

      const payload = (await response.json()) as { jobId: string };
      setCreatedJobs((previous) => ({ ...previous, [messageId]: payload.jobId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setBusyMessage(null);
    }
  }

  if (!messages.length) {
    return <p className="meta">No pending Teams intake messages.</p>;
  }

  return (
    <div className="grid">
      {error ? <p className="warning">{error}</p> : null}

      {messages.map((message) => (
        <article key={message.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginBottom: "0.25rem" }}>{message.siteName}</h3>
              <div className="meta">
                {message.sourceChannel} · {new Date(message.receivedAt).toLocaleString()}
              </div>
            </div>
            <span className="pill">{message.type}</span>
          </div>

          <p>{message.description}</p>

          <p className="meta" style={{ marginBottom: "0.25rem" }}>
            Materials: {message.materials.join(", ")}
          </p>
          <p className="meta" style={{ marginTop: 0 }}>
            Attachments: {message.attachments.join(", ")}
          </p>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={() => createJob(message.id)} disabled={busyMessage !== null}>
              {busyMessage === message.id ? "Creating..." : "Create Job ID"}
            </button>
            {createdJobs[message.id] ? (
              <Link className="btn secondary" href={`/admin/jobs/${createdJobs[message.id]}`}>
                Open {createdJobs[message.id]}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
