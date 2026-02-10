import type { NextRequest } from "next/server";
import { err, getUserWithPermission, ok } from "@/lib/api-helpers";
import { searchArchive } from "@/lib/mock-db";
import { canAccessJob } from "@/lib/scope";
import type { ArchiveFilters, JobType } from "@/types/domain";

export async function GET(request: NextRequest) {
  try {
    const user = getUserWithPermission(request, "archive:read");
    const url = new URL(request.url);

    const filters: ArchiveFilters = {
      jobId: url.searchParams.get("jobId") ?? undefined,
      siteName: url.searchParams.get("siteName") ?? undefined,
      type: (url.searchParams.get("type") as JobType | null) ?? undefined,
      dateFrom: url.searchParams.get("dateFrom") ?? undefined,
      dateTo: url.searchParams.get("dateTo") ?? undefined
    };

    const jobs = searchArchive(filters).filter((job) => canAccessJob(user, job));
    return ok({ jobs });
  } catch (error) {
    return err(error);
  }
}
