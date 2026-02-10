import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getJob } from "@/lib/mock-db";
import { assertPermission, type Permission } from "@/lib/rbac";
import { assertJobScope } from "@/lib/scope";
import type { Job, UserProfile } from "@/types/domain";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export function fail(status: number, message: string): never {
  throw new HttpError(message, status);
}

export function ok(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function err(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}

export function getUserWithPermission(request: NextRequest, permission: Permission): UserProfile {
  const user = getUserFromRequest(request);

  try {
    assertPermission(user, permission);
  } catch {
    fail(403, `Permission denied: ${permission}`);
  }

  return user;
}

export function getJobWithAccess(
  request: NextRequest,
  jobId: string,
  permission: Permission
): { user: UserProfile; job: Job } {
  const user = getUserWithPermission(request, permission);
  const job = getJob(jobId);

  if (!job) {
    fail(404, `Job ${jobId} not found`);
  }

  try {
    assertJobScope(user, job);
  } catch {
    fail(403, `Job scope denied for ${jobId}`);
  }

  return { user, job };
}

export function getJobWithScopeOnly(
  request: NextRequest,
  jobId: string
): { user: UserProfile; job: Job } {
  const user = getUserFromRequest(request);
  const job = getJob(jobId);

  if (!job) {
    fail(404, `Job ${jobId} not found`);
  }

  try {
    assertJobScope(user, job);
  } catch {
    fail(403, `Job scope denied for ${jobId}`);
  }

  return { user, job };
}
