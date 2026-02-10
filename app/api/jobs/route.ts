import type { NextRequest } from "next/server";
import { err, getUserWithPermission, ok } from "@/lib/api-helpers";
import { listJobs } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";
import type { JobFilters, JobStatus, JobType } from "@/types/domain";

export async function GET(request: NextRequest) {
  try {
    const user = getUserWithPermission(request, "job:read");
    const url = new URL(request.url);

    const filters: JobFilters = {
      q: url.searchParams.get("q") ?? undefined,
      site: url.searchParams.get("site") ?? undefined,
      assignedTechId: url.searchParams.get("tech") ?? undefined,
      status: (url.searchParams.get("status") as JobStatus | null) ?? undefined,
      type: (url.searchParams.get("type") as JobType | null) ?? undefined
    };

    const jobs = listJobs(filters).filter((job) => canAccessJob(user, job));
    return ok({ jobs });
  } catch (error) {
    return err(error);
  }
}
