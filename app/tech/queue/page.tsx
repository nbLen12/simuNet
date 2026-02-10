import { GlobalQueue } from "@/components/tech/global-queue";
import { SyncIndicator } from "@/components/tech/sync-indicator";

export default function TechQueuePage(): React.ReactElement {
  return (
    <>
      <section className="card" style={{ background: "#f7fffb" }}>
        <h2>Upload Queue</h2>
        <p className="meta">
          Pending/Sent/Confirmed states for queued field events. Use retry when signal recovers.
        </p>
        <SyncIndicator />
      </section>
      <GlobalQueue />
    </>
  );
}
