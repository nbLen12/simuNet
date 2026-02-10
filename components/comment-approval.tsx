"use client";

import { useState } from "react";

export function CommentApproval({ jobId }: { jobId: string }): React.ReactElement {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "APPROVE" | "REJECT"): Promise<void> {
    setLoading(decision === "APPROVE" ? "approve" : "reject");
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/approvals`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ decision, comment })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Approval update failed");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card">
      <h3>Review Decision</h3>
      <label htmlFor="review-comment">Comment (required on reject)</label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        placeholder="Add review note"
      />

      {error ? (
        <p className="warning" style={{ marginBottom: "0.2rem" }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button onClick={() => submit("APPROVE")} disabled={Boolean(loading)}>
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
        <button className="danger" onClick={() => submit("REJECT")} disabled={Boolean(loading)}>
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
