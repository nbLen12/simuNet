export type QueueStatus = "PENDING" | "SENT" | "CONFIRMED" | "FAILED";

export interface QueueItem {
  id: string;
  jobId: string;
  technicianId: string;
  note?: string;
  photoName?: string;
  createdAt: string;
  status: QueueStatus;
}

export function UploadQueue({
  items,
  onRetry,
  title = "Upload Queue"
}: {
  items: QueueItem[];
  onRetry?: () => void;
  title?: string;
}): React.ReactElement {
  const pendingCount = items.filter((item) => item.status === "PENDING" || item.status === "FAILED").length;

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginBottom: "0.4rem" }}>{title}</h3>
        <span className="pill">Pending: {pendingCount}</span>
      </div>
      {!items.length ? <p className="meta">No queued updates.</p> : null}

      <div className="grid">
        {items.map((item) => (
          <article key={item.id} className="upload-item">
            <strong>
              {item.jobId} · {item.status}
            </strong>
            <span className="meta">Event {item.id}</span>
            <span className="meta">{new Date(item.createdAt).toLocaleString()}</span>
            {item.photoName ? <span className="meta">Photo: {item.photoName}</span> : null}
            {item.note ? <span>{item.note}</span> : null}
          </article>
        ))}
      </div>

      {onRetry ? (
        <div style={{ marginTop: "0.8rem" }}>
          <button className="secondary" onClick={onRetry}>
            Retry Pending
          </button>
        </div>
      ) : null}
    </section>
  );
}
