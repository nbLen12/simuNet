import type { NextRequest } from "next/server";
import { err, getJobWithAccess, ok } from "@/lib/api-helpers";
import { getJobWorkspace } from "@/lib/mock-db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    getJobWithAccess(request, jobId, "job:read");

    const workspace = getJobWorkspace(jobId);
    return ok({ workspace });
  } catch (error) {
    return err(error);
  }
}
