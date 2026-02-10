"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadQueue, type QueueItem } from "@/components/upload-queue";

const QUEUE_KEY = "simuNet.tech.queue.v1";
const LAST_SYNC_KEY = "simuNet.tech.lastSync";

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]): void {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function EvidenceCapture({
  jobId,
  technicianId
}: {
  jobId: string;
  technicianId: string;
}): React.ReactElement {
  const [note, setNote] = useState("");
  const [photoName, setPhotoName] = useState<string | undefined>();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const items = readQueue();
    setQueue(items);

    const sync = window.localStorage.getItem(LAST_SYNC_KEY);
    if (sync) {
      setLastSync(sync);
    }
  }, []);

  const currentJobQueue = useMemo(
    () => queue.filter((item) => item.jobId === jobId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [queue, jobId]
  );

  function pushEvent(): void {
    const trimmedNote = note.trim();
    if (!trimmedNote && !photoName) {
      setError("Add a note or a photo before queuing.");
      return;
    }

    const event: QueueItem = {
      id: globalThis.crypto.randomUUID(),
      jobId,
      technicianId,
      note: trimmedNote || undefined,
      photoName,
      createdAt: new Date().toISOString(),
      status: "PENDING"
    };

    const next = [event, ...queue];
    setQueue(next);
    writeQueue(next);
    setNote("");
    setPhotoName(undefined);
    setError(null);
  }

  async function syncPending(): Promise<void> {
    const pending = queue.filter((item) => item.status === "PENDING" || item.status === "FAILED");
    if (!pending.length) {
      return;
    }

    setBusy(true);
    setError(null);

    const nextQueue = [...queue];

    for (const item of pending) {
      const index = nextQueue.findIndex((current) => current.id === item.id);
      if (index < 0) {
        continue;
      }

      nextQueue[index] = { ...nextQueue[index], status: "SENT" };
      setQueue([...nextQueue]);

      try {
        const response = await fetch(`/api/jobs/${item.jobId}/events`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            eventId: item.id,
            note: item.note,
            photoName: item.photoName
          })
        });

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        nextQueue[index] = { ...nextQueue[index], status: "CONFIRMED" };
      } catch {
        nextQueue[index] = { ...nextQueue[index], status: "FAILED" };
      }

      setQueue([...nextQueue]);
      writeQueue(nextQueue);
    }

    const syncTime = new Date().toISOString();
    window.localStorage.setItem(LAST_SYNC_KEY, syncTime);
    setLastSync(syncTime);
    setBusy(false);
  }

  function openWhatsAppFallback(): void {
    const pending = currentJobQueue.filter(
      (item) => item.status === "PENDING" || item.status === "FAILED"
    );

    const text = [
      `FSM fallback submission`,
      `job_id=${jobId}`,
      `event_ids=${pending.map((item) => item.id).join(",") || "none"}`,
      ...pending.map(
        (item) =>
          `${item.id}: ${item.note ?? ""}${item.photoName ? ` [photo=${item.photoName}]` : ""}`
      )
    ].join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid">
      <section className="card">
        <h3>Capture Evidence</h3>
        <p className="meta">Every upload is first queued locally as an event for offline resilience.</p>
        <div className="form-row">
          <div>
            <label htmlFor="photo">Site photo</label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => setPhotoName(event.target.files?.[0]?.name)}
            />
          </div>
          <div>
            <label htmlFor="note">Work note</label>
            <textarea
              id="note"
              value={note}
              rows={3}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Describe work completed"
            />
          </div>
        </div>

        {error ? <p className="warning">{error}</p> : null}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
          <button onClick={pushEvent}>Queue Update</button>
          <button className="secondary" onClick={syncPending} disabled={busy}>
            {busy ? "Syncing..." : "Sync Queue"}
          </button>
          <button className="ghost" onClick={openWhatsAppFallback}>
            Send queued updates via WhatsApp
          </button>
        </div>

        <p className="meta" style={{ marginTop: "0.6rem" }}>
          Last sync time: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
        </p>
      </section>

      <UploadQueue items={currentJobQueue} onRetry={syncPending} title="Job Upload Queue" />
    </div>
  );
}
