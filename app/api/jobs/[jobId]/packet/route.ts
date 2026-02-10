import type { NextRequest } from "next/server";
import { err, fail, getJobWithScopeOnly, ok } from "@/lib/api-helpers";
import { archiveJob, generateFinalPacket, submitFinalPacket } from "@/lib/mock-db";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const { user } = getJobWithScopeOnly(request, jobId);

    const body = (await request.json()) as {
      action?: "GENERATE" | "SUBMIT" | "ARCHIVE";
    };

    if (!body.action) {
      fail(400, "action is required");
    }

    if (!hasPermission(user, "packet:generate") && !hasPermission(user, "job:status:update")) {
      fail(403, "Permission denied: packet actions");
    }

    if (body.action === "GENERATE") {
      return ok({ packet: generateFinalPacket(jobId, user) });
    }

    if (body.action === "SUBMIT") {
      return ok({ job: submitFinalPacket(jobId, user) });
    }

    if (body.action === "ARCHIVE") {
      return ok({ job: archiveJob(jobId, user) });
    }

    fail(400, "Unknown action");
  } catch (error) {
    return err(error);
  }
}
