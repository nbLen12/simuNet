import type { NextRequest } from "next/server";
import { err, fail, getJobWithScopeOnly, ok } from "@/lib/api-helpers";
import { approveJob, assignTechnicians, setJobStatus } from "@/lib/mock-db";
import { hasPermission } from "@/lib/rbac";
import type { JobStatus } from "@/types/domain";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const { user } = getJobWithScopeOnly(request, jobId);
    const body = (await request.json()) as {
      action?: "APPROVE" | "ASSIGN" | "SET_STATUS" | "START_WORK" | "SITE_COMPLETE";
      techIds?: string[];
      status?: JobStatus;
    };

    const action = body.action;

    if (action === "APPROVE") {
      if (!hasPermission(user, "job:approve")) {
        fail(403, "Permission denied: job approve");
      }

      return ok({ job: approveJob(jobId, user) });
    }

    if (action === "ASSIGN") {
      if (!hasPermission(user, "job:assign")) {
        fail(403, "Permission denied: job assign");
      }

      return ok({ job: assignTechnicians(jobId, body.techIds ?? [], user) });
    }

    if (action === "SET_STATUS") {
      if (!hasPermission(user, "job:status:update")) {
        fail(403, "Permission denied: status update");
      }

      if (!body.status) {
        fail(400, "status is required for SET_STATUS");
      }

      return ok({ job: setJobStatus(jobId, body.status, user) });
    }

    if (action === "START_WORK") {
      if (!hasPermission(user, "job:status:update")) {
        fail(403, "Permission denied: status update");
      }

      return ok({
        job: setJobStatus(jobId, "IN_PROGRESS", user, "Technician started on-site execution.")
      });
    }

    if (action === "SITE_COMPLETE") {
      if (!hasPermission(user, "job:status:update")) {
        fail(403, "Permission denied: status update");
      }

      return ok({
        job: setJobStatus(jobId, "SITE_WORK_COMPLETE", user, "Technician marked site work complete.")
      });
    }

    fail(400, "Unknown action");
  } catch (error) {
    return err(error);
  }
}
