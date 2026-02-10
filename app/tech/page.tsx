import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { SyncIndicator } from "@/components/tech/sync-indicator";
import { getCurrentUser } from "@/lib/auth";
import { listJobs } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";

export default async function TechJobsPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  const jobs = listJobs().filter((job) => canAccessJob(user, job));

  return (
    <>
      <section className="card" style={{ background: "#f7fffb" }}>
        <h2 style={{ marginBottom: "0.3rem" }}>My Jobs</h2>
        <p className="meta">Cached assignments with offline-safe evidence queue.</p>
        <SyncIndicator />
      </section>

      {jobs.map((job) => (
        <article key={job.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
            <strong>{job.id}</strong>
            <StatusBadge status={job.status} />
          </div>
          <p style={{ marginBottom: "0.35rem" }}>
            {job.siteName} · {job.type}
          </p>
          <p className="meta" style={{ marginTop: 0 }}>
            {job.description}
          </p>
          <Link className="btn" href={`/tech/jobs/${job.id}`}>
            Open Job
          </Link>
        </article>
      ))}
    </>
  );
}
