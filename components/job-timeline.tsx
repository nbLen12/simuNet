import type { JobEvent } from "@/types/domain";

export function JobTimeline({ events }: { events: JobEvent[] }): React.ReactElement {
  if (!events.length) {
    return <p className="meta">No activity logged yet.</p>;
  }

  return (
    <div className="timeline">
      {events.map((event) => (
        <article key={event.id} className="timeline-item">
          <strong>{event.message}</strong>
          <div className="meta">
            {event.actorName} ({event.actorId}) on {new Date(event.createdAt).toLocaleString()}
          </div>
        </article>
      ))}
    </div>
  );
}
