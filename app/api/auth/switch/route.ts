import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_USERS, DEFAULT_USER_ID } from "@/lib/demo-users";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? DEFAULT_USER_ID;
  const nextPath = url.searchParams.get("next") ?? "/";

  const resolvedUserId = DEMO_USERS[userId] ? userId : DEFAULT_USER_ID;
  const safePath = nextPath.startsWith("/") ? nextPath : "/";

  const response = NextResponse.redirect(new URL(safePath, request.url));
  response.cookies.set("simu_user", resolvedUserId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
