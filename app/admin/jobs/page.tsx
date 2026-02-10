import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { listJobs } from "@/lib/mock-db";
import type { JobFilters, JobStatus, JobType } from "@/types/domain";

export default async function AdminJobsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const params = await searchParams;

  const filters: JobFilters = {
    q: typeof params.q === "string" ? params.q : undefined,
    site: typeof params.site === "string" ? params.site : undefined,
    assignedTechId: typeof params.tech === "string" ? params.tech : undefined,
    status: typeof params.status === "string" ? (params.status as JobStatus) : undefined,
    type: typeof params.type === "string" ? (params.type as JobType) : undefined
  };

  const jobs = listJobs(filters);

  return (
    <section className="card">
      <h2>Jobs</h2>

      <form className="form-row" method="GET">
        <div>
          <label htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={filters.q} placeholder="Job ID, site, or client ref" />
        </div>
        <div>
          <label htmlFor="site">Site</label>
          <input id="site" name="site" defaultValue={filters.site} />
        </div>
        <div>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={filters.type ?? ""}>
            <option value="">All</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="SMALL_WORKS">Small Works</option>
          </select>
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">All</option>
            <option value="RECEIVED">Received</option>
            <option value="APPROVED">Approved</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SITE_WORK_COMPLETE">Site Work Complete</option>
            <option value="DIARY_PENDING">Diary Pending</option>
            <option value="DIARY_SENT">Diary Sent</option>
            <option value="DIARY_APPROVED">Diary Approved</option>
            <option value="PACKET_GENERATED">Packet Generated</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label htmlFor="tech">Assigned Tech</label>
          <input id="tech" name="tech" defaultValue={filters.assignedTechId} placeholder="tech_ali" />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit">Apply Filters</button>
        </div>
      </form>

      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Site</th>
            <th>Type</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.siteName}</td>
              <td>{job.type}</td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td>{job.assignedTechIds.join(", ") || "-"}</td>
              <td>{new Date(job.updatedAt).toLocaleString()}</td>
              <td>
                <Link className="btn secondary" href={`/admin/jobs/${job.id}`}>
                  Workspace
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
