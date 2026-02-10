import { notFound, redirect } from "next/navigation";
import { EvidenceCapture } from "@/components/tech/evidence-capture";
import { StatusControls } from "@/components/tech/status-controls";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { getJobWorkspace } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";

export default async function TechJobDetailPage({
  params
}: {
  params: Promise<{ jobId: string }>;
}): Promise<React.ReactElement> {
  const { jobId } = await params;
  const user = await getCurrentUser();

  if (user.role !== "TECH") {
    redirect("/unauthorized?required=TECH");
  }

  const workspace = getJobWorkspace(jobId);
  if (!workspace) {
    notFound();
  }

  if (!canAccessJob(user, workspace.job)) {
    redirect("/unauthorized?required=TECH&current=TECH");
  }

  return (
    <>
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center" }}>
          <h2 style={{ marginBottom: "0.2rem" }}>{workspace.job.id}</h2>
          <StatusBadge status={workspace.job.status} />
        </div>
        <p style={{ marginBottom: "0.45rem" }}>
          <strong>{workspace.job.siteName}</strong> · {workspace.job.type}
        </p>
        <p>{workspace.job.description}</p>
        <p className="meta">Required materials: {workspace.job.requiredMaterials.join(", ")}</p>
      </section>

      <section className="card">
        <h3>Evidence Checklist</h3>
        <ul style={{ marginTop: 0 }}>
          <li>At least one site photo</li>
          <li>Work note with completed steps</li>
          <li>Set status to Site Work Complete after upload</li>
        </ul>
      </section>

      <StatusControls jobId={workspace.job.id} currentStatus={workspace.job.status} />
      <EvidenceCapture jobId={workspace.job.id} technicianId={user.id} />
    </>
  );
}
