import type { PortalRole, UserProfile } from "@/types/domain";

export type Permission =
  | "teams:intake:read"
  | "teams:intake:create_job"
  | "job:read"
  | "job:approve"
  | "job:assign"
  | "job:status:update"
  | "diary:draft"
  | "diary:send"
  | "diary:approve"
  | "packet:generate"
  | "archive:read"
  | "evidence:upload"
  | "packet:download";

const ROLE_PERMISSIONS: Record<PortalRole, Permission[]> = {
  ADMIN: [
    "teams:intake:read",
    "teams:intake:create_job",
    "job:read",
    "job:approve",
    "job:assign",
    "job:status:update",
    "diary:draft",
    "diary:send",
    "packet:generate",
    "archive:read",
    "packet:download"
  ],
  TECH: ["job:read", "job:status:update", "evidence:upload"],
  CLIENT: ["job:read", "diary:approve", "packet:download"]
};

export function hasPermission(user: UserProfile, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function assertPermission(user: UserProfile, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`User ${user.id} missing permission ${permission}`);
  }
}
