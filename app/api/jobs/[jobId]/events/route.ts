import type { NextRequest } from "next/server";
import { err, fail, getJobWithScopeOnly, ok } from "@/lib/api-helpers";
import { addEvidence } from "@/lib/mock-db";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const { user } = getJobWithScopeOnly(request, jobId);

    if (!hasPermission(user, "evidence:upload") && !hasPermission(user, "job:status:update")) {
      fail(403, "Permission denied: evidence upload");
    }

    const body = (await request.json()) as {
      eventId?: string;
      note?: string;
      photoName?: string;
    };

    const job = addEvidence(jobId, user, {
      note: body.note,
      photoName: body.photoName
    });

    return ok({ jobId: job.id, status: job.status, eventId: body.eventId ?? null });
  } catch (error) {
    return err(error);
  }
}
