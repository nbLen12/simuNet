import type { Job, UserProfile } from "@/types/domain";

function userHasSiteScope(user: UserProfile, siteName: string): boolean {
  return user.scope.sites.includes("*") || user.scope.sites.includes(siteName);
}

function userHasExplicitScope(user: UserProfile, jobId: string): boolean {
  return user.scope.explicitJobIds.includes(jobId);
}

export function canAccessJob(user: UserProfile, job: Job): boolean {
  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "TECH") {
    return job.assignedTechIds.includes(user.id) || userHasExplicitScope(user, job.id);
  }

  return userHasSiteScope(user, job.siteName) || userHasExplicitScope(user, job.id);
}

export function assertJobScope(user: UserProfile, job: Job): void {
  if (!canAccessJob(user, job)) {
    throw new Error(`User ${user.id} is out of scope for job ${job.id}`);
  }
}
