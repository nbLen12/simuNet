import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CommentApproval } from "@/components/comment-approval";
import { DocumentList } from "@/components/document-list";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { getJobWorkspace } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";

export default async function ClientDiaryReviewPage({
  params
}: {
  params: Promise<{ jobId: string }>;
}): Promise<React.ReactElement> {
  const { jobId } = await params;
  const user = await getCurrentUser();

  if (user.role !== "CLIENT") {
    redirect("/unauthorized?required=CLIENT");
  }

  const workspace = getJobWorkspace(jobId);
  if (!workspace) {
    notFound();
  }

  if (!canAccessJob(user, workspace.job)) {
    redirect("/unauthorized?required=CLIENT&current=CLIENT");
  }

  if (!workspace.diary) {
    return (
      <section className="card">
        <h2>{workspace.job.id}</h2>
        <p className="meta">No diary has been submitted for this job.</p>
        <Link className="btn secondary" href="/client">
          Back
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <h2>Diary Review: {workspace.job.id}</h2>
        <p className="meta">{workspace.job.siteName}</p>
        <StatusBadge status={workspace.job.status} />
        <p style={{ marginTop: "0.8rem" }}>
          <strong>Diary v{workspace.diary.version}</strong>
        </p>
        <p>{workspace.diary.content}</p>
        <p className="meta">Updated: {new Date(workspace.diary.updatedAt).toLocaleString()}</p>
      </section>

      <section className="card">
        <h3>Diary Snippet PDF & Related Documents</h3>
        <DocumentList documents={workspace.documents} />
      </section>

      {workspace.diary.status === "SENT" ? (
        <CommentApproval jobId={workspace.job.id} />
      ) : (
        <section className="card">
          <h3>Decision History</h3>
          <p>
            Current diary state: <strong>{workspace.diary.status}</strong>
          </p>
          {workspace.diary.reviewerComment ? (
            <p>
              <strong>Your comment:</strong> {workspace.diary.reviewerComment}
            </p>
          ) : null}
        </section>
      )}

      <section className="card">
        <Link className="btn secondary" href="/client">
          Back to approvals
        </Link>
      </section>
    </>
  );
}
