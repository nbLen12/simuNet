import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { searchArchive } from "@/lib/mock-db";
import type { ArchiveFilters, JobType } from "@/types/domain";

export default async function AdminArchivePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const params = await searchParams;

  const filters: ArchiveFilters = {
    jobId: typeof params.jobId === "string" ? params.jobId : undefined,
    siteName: typeof params.siteName === "string" ? params.siteName : undefined,
    type: typeof params.type === "string" ? (params.type as JobType) : undefined,
    dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
    dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined
  };

  const jobs = searchArchive(filters);

  return (
    <section className="card">
      <h2>Archive</h2>
      <p className="meta">Fast retrieval by Job ID, site, type, and date range.</p>

      <form method="GET" className="form-row">
        <div>
          <label htmlFor="jobId">Job ID</label>
          <input id="jobId" name="jobId" defaultValue={filters.jobId} />
        </div>
        <div>
          <label htmlFor="siteName">Site</label>
          <input id="siteName" name="siteName" defaultValue={filters.siteName} />
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
          <label htmlFor="dateFrom">Date from</label>
          <input id="dateFrom" name="dateFrom" type="date" defaultValue={filters.dateFrom} />
        </div>
        <div>
          <label htmlFor="dateTo">Date to</label>
          <input id="dateTo" name="dateTo" type="date" defaultValue={filters.dateTo} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit">Search</button>
        </div>
      </form>

      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Site</th>
            <th>Type</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
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
              <td>{new Date(job.updatedAt).toLocaleString()}</td>
              <td style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                <Link className="btn secondary" href={`/admin/jobs/${job.id}`}>
                  Audit Trail
                </Link>
                <Link className="btn ghost" href={`/api/jobs/${job.id}`}>
                  Export JSON
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
