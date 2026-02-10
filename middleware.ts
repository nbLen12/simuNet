import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_USERS, DEFAULT_USER_ID } from "@/lib/demo-users";

const ROLE_PREFIX = {
  ADMIN: "/admin",
  TECH: "/tech",
  CLIENT: "/client"
} as const;

function requiredRole(pathname: string): keyof typeof ROLE_PREFIX | undefined {
  if (pathname.startsWith("/admin")) {
    return "ADMIN";
  }

  if (pathname.startsWith("/tech")) {
    return "TECH";
  }

  if (pathname.startsWith("/client")) {
    return "CLIENT";
  }

  return undefined;
}

export function middleware(request: NextRequest): NextResponse {
  const roleNeeded = requiredRole(request.nextUrl.pathname);
  if (!roleNeeded) {
    return NextResponse.next();
  }

  const userId = request.cookies.get("simu_user")?.value ?? DEFAULT_USER_ID;
  const user = DEMO_USERS[userId] ?? DEMO_USERS[DEFAULT_USER_ID];

  if (user.role !== roleNeeded) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.searchParams.set("required", roleNeeded);
    url.searchParams.set("current", user.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tech/:path*", "/client/:path*"]
};
