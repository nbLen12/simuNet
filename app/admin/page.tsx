import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { JOB_STATUS_LABELS } from "@/lib/state-machine";
import { getPipelineCounts, listStuckJobs } from "@/lib/mock-db";
import type { JobStatus } from "@/types/domain";

const DASHBOARD_ORDER: JobStatus[] = [
  "RECEIVED",
  "APPROVED",
  "ASSIGNED",
  "SITE_WORK_COMPLETE",
  "DIARY_PENDING",
  "DIARY_SENT",
  "DIARY_APPROVED",
  "PACKET_GENERATED",
  "SUBMITTED",
  "ARCHIVED"
];

export default function AdminDashboardPage(): React.ReactElement {
  const pipeline = getPipelineCounts();
  const stuckJobs = listStuckJobs(180);

  return (
    <>
      <section className="card">
        <h2>Job Pipeline</h2>
        <div className="grid cols-3">
          {DASHBOARD_ORDER.map((status) => (
            <article key={status} className="kpi">
              <div className="label">{JOB_STATUS_LABELS[status]}</div>
              <div className="value">{pipeline[status]}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Stuck Jobs</h2>
          <span className="meta">Idle threshold: 180 minutes</span>
        </div>

        {!stuckJobs.length ? (
          <p className="meta">No stuck jobs detected.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Site</th>
                <th>Status</th>
                <th>Last State Change</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stuckJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.siteName}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{new Date(job.lastStateChangeAt).toLocaleString()}</td>
                  <td>
                    <Link className="btn secondary" href={`/admin/jobs/${job.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
