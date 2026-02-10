import { notFound } from "next/navigation";
import { DocumentList } from "@/components/document-list";
import { JobWorkspaceActions } from "@/components/admin/job-workspace-actions";
import { JobTimeline } from "@/components/job-timeline";
import { StatusBadge } from "@/components/status-badge";
import { getJobWorkspace } from "@/lib/mock-db";

export default async function AdminJobWorkspacePage({
  params
}: {
  params: Promise<{ jobId: string }>;
}): Promise<React.ReactElement> {
  const { jobId } = await params;
  const workspace = getJobWorkspace(jobId);

  if (!workspace) {
    notFound();
  }

  return (
    <>
      <section className="card">
        <h2 style={{ marginBottom: "0.4rem" }}>Job Workspace: {workspace.job.id}</h2>
        <div className="meta" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <span>Type: {workspace.job.type}</span>
          <span>Site: {workspace.job.siteName}</span>
          <span>Client Ref: {workspace.job.clientReference}</span>
          <span>Assigned: {workspace.job.assignedTechIds.join(", ") || "Unassigned"}</span>
        </div>
        <div style={{ marginTop: "0.7rem" }}>
          <StatusBadge status={workspace.job.status} />
        </div>
      </section>

      <JobWorkspaceActions
        jobId={workspace.job.id}
        currentStatus={workspace.job.status}
        assignedTechIds={workspace.job.assignedTechIds}
      />

      <section className="card">
        <h3>Activity Feed</h3>
        <JobTimeline events={workspace.events} />
      </section>

      <section className="card">
        <h3>Documents</h3>
        <DocumentList documents={workspace.documents} />
      </section>

      <section className="card">
        <h3>Diary</h3>
        {workspace.diary ? (
          <>
            <p className="meta">
              Version {workspace.diary.version} · Status {workspace.diary.status} · Updated{" "}
              {new Date(workspace.diary.updatedAt).toLocaleString()}
            </p>
            {workspace.diary.reviewerComment ? (
              <p>
                <strong>Reviewer Comment:</strong> {workspace.diary.reviewerComment}
              </p>
            ) : null}
            <p>{workspace.diary.content}</p>
          </>
        ) : (
          <p className="meta">No diary drafted yet.</p>
        )}
      </section>

      <section className="card">
        <h3>Audit Log</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Event</th>
              <th>Message</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {workspace.events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.createdAt).toLocaleString()}</td>
                <td>{event.actorName}</td>
                <td>{event.type}</td>
                <td>{event.message}</td>
                <td>
                  <code>{event.metadata ? JSON.stringify(event.metadata) : "-"}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
