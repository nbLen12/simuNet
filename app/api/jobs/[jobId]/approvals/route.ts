import type { NextRequest } from "next/server";
import { err, fail, getJobWithScopeOnly, ok } from "@/lib/api-helpers";
import { reviewDiary } from "@/lib/mock-db";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const { user } = getJobWithScopeOnly(request, jobId);

    if (!hasPermission(user, "diary:approve")) {
      fail(403, "Permission denied: diary approve");
    }

    const body = (await request.json()) as {
      decision?: "APPROVE" | "REJECT";
      comment?: string;
    };

    if (!body.decision) {
      fail(400, "decision is required");
    }

    if (body.decision === "REJECT" && !body.comment?.trim()) {
      fail(400, "comment is required when rejecting");
    }

    const diary = reviewDiary(jobId, user, body.decision, body.comment?.trim());

    return ok({ diary });
  } catch (error) {
    return err(error);
  }
}
