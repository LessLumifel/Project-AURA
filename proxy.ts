import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/auth/constants";
import { verifySessionToken } from "./lib/auth/session";

function unauthorized(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${pathname}${search}`;
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return unauthorized(request);

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: "Server auth is not configured" }, { status: 500 });
  }

  const session = await verifySessionToken(token, secret);
  if (!session) return unauthorized(request);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/member/:path*",
    "/tools/:path*",
    "/api/member/:path*",
    "/api/admin/:path*",
    "/api/drafts/:path*",
    "/api/media/:path*",
    "/api/upload/:path*",
    "/api/pandoc/:path*"
  ]
};
