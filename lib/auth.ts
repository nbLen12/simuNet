import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { UserProfile } from "@/types/domain";
import { DEMO_USERS, DEFAULT_USER_ID, resolveDemoUser } from "@/lib/demo-users";

export const ROLE_HOME = {
  ADMIN: "/admin",
  TECH: "/tech",
  CLIENT: "/client"
} as const;

export async function getCurrentUser(): Promise<UserProfile> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("simu_user")?.value ?? DEFAULT_USER_ID;

  return resolveDemoUser(userId);
}

export function getUserFromRequest(request: NextRequest): UserProfile {
  const userId = request.cookies.get("simu_user")?.value;
  return resolveDemoUser(userId);
}

export function listDemoUsers(): UserProfile[] {
  return Object.values(DEMO_USERS);
}
