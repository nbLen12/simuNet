import type { NextRequest } from "next/server";
import { err, fail, getUserWithPermission, ok } from "@/lib/api-helpers";
import { createJobFromTeamsMessage, listTeamsInbox } from "@/lib/mock-db";

export async function GET(request: NextRequest) {
  try {
    getUserWithPermission(request, "teams:intake:read");
    return ok({ messages: listTeamsInbox() });
  } catch (error) {
    return err(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserWithPermission(request, "teams:intake:create_job");
    const body = (await request.json()) as { messageId?: string };

    if (!body.messageId) {
      fail(400, "messageId is required");
    }

    const job = createJobFromTeamsMessage(body.messageId, user);
    return ok({ jobId: job.id, job });
  } catch (error) {
    return err(error);
  }
}
