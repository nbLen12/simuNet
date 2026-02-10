"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadQueue, type QueueItem } from "@/components/upload-queue";

const QUEUE_KEY = "simuNet.tech.queue.v1";

function loadQueue(): QueueItem[] {
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

function saveQueue(items: QueueItem[]): void {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function GlobalQueue(): React.ReactElement {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    setQueue(loadQueue());
  }, []);

  const pending = useMemo(
    () => queue.filter((item) => item.status === "PENDING" || item.status === "FAILED"),
    [queue]
  );

  async function retry(): Promise<void> {
    const next = [...queue];

    for (const item of pending) {
      const index = next.findIndex((candidate) => candidate.id === item.id);
      if (index < 0) {
        continue;
      }

      next[index] = { ...next[index], status: "SENT" };
      setQueue([...next]);

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

        next[index] = {
          ...next[index],
          status: response.ok ? "CONFIRMED" : "FAILED"
        };
      } catch {
        next[index] = { ...next[index], status: "FAILED" };
      }

      setQueue([...next]);
      saveQueue(next);
    }
  }

  return <UploadQueue items={queue} onRetry={retry} title="All Queued Uploads" />;
}
