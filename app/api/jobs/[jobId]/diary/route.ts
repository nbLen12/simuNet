import type { NextRequest } from "next/server";
import { err, fail, getJobWithScopeOnly, ok } from "@/lib/api-helpers";
import { generateDiaryPdf, sendDiary, upsertDiary } from "@/lib/mock-db";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const { user } = getJobWithScopeOnly(request, jobId);

    const body = (await request.json()) as {
      action?: "SAVE_DRAFT" | "GENERATE_PDF" | "SEND";
      diary?: string;
    };

    if (body.action === "SAVE_DRAFT") {
      if (!hasPermission(user, "diary:draft")) {
        fail(403, "Permission denied: diary draft");
      }

      if (!body.diary?.trim()) {
        fail(400, "Diary content is required");
      }

      return ok({ diary: upsertDiary(jobId, user, body.diary.trim()) });
    }

    if (body.action === "GENERATE_PDF") {
      if (!hasPermission(user, "diary:draft")) {
        fail(403, "Permission denied: diary draft");
      }

      return ok({ document: generateDiaryPdf(jobId, user) });
    }

    if (body.action === "SEND") {
      if (!hasPermission(user, "diary:send")) {
        fail(403, "Permission denied: diary send");
      }

      return ok({ diary: sendDiary(jobId, user) });
    }

    fail(400, "Unknown action");
  } catch (error) {
    return err(error);
  }
}
