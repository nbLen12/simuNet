import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { getJobDocuments, listJobs, listPendingDiaryApprovals, searchArchive } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";

export default async function ClientApprovalsPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  const pending = listPendingDiaryApprovals().filter(({ job }) => canAccessJob(user, job));
  const visibleJobs = listJobs().filter((job) => canAccessJob(user, job));
  const packetJobs = searchArchive().filter((job) => canAccessJob(user, job));

  return (
    <>
      <section className="card">
        <h2>Diary Approvals</h2>
        {!pending.length ? (
          <p className="meta">No diaries currently waiting for your review.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Site</th>
                <th>Version</th>
                <th>Status</th>
                <th>Timestamp</th>
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
                    <Link className="btn" href={`/client/diaries/${job.id}`}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Job Status (Read-only)</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Site</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {visibleJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.siteName}</td>
                <td>
                  <StatusBadge status={job.status} />
                </td>
                <td>{new Date(job.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Final Packet Access</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Site</th>
              <th>Status</th>
              <th>Packet</th>
            </tr>
          </thead>
          <tbody>
            {packetJobs.map((job) => {
              const packet = getJobDocuments(job.id).find((document) => document.type === "FINAL_PACKET");

              return (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.siteName}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>
                    {packet ? (
                      <Link className="btn secondary" href={`/api/jobs/${job.id}`}>
                        Download (JSON demo)
                      </Link>
                    ) : (
                      <span className="meta">Not generated yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
