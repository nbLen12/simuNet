import Link from "next/link";
import { listJobs, listPendingDiaryApprovals } from "@/lib/mock-db";
import { StatusBadge } from "@/components/status-badge";

export default function AdminApprovalsPage(): React.ReactElement {
  const pending = listPendingDiaryApprovals();
  const rejectedLoop = listJobs({ status: "DIARY_PENDING" });

  return (
    <div className="grid">
      <section className="card">
        <h2>Waiting on Client Diary Feedback</h2>
        {!pending.length ? (
          <p className="meta">No diaries currently waiting for client decision.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Site</th>
                <th>Diary Version</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(({ job, diary }) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.siteName}</td>
                  <td>v{diary.version}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{new Date(diary.updatedAt).toLocaleString()}</td>
                  <td>
                    <Link className="btn secondary" href={`/admin/jobs/${job.id}`}>
                      Open Workspace
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Rejection/Edit Loop Visibility</h2>
        {!rejectedLoop.length ? (
          <p className="meta">No diaries in pending edit loop.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Site</th>
                <th>Status</th>
                <th>Assigned</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rejectedLoop.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.siteName}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{job.assignedTechIds.join(", ") || "-"}</td>
                  <td>
                    <Link className="btn secondary" href={`/admin/jobs/${job.id}`}>
                      Open Workspace
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
