import { NextResponse, type NextRequest } from "next/server";
import { isLiveToken } from "@/lib/live-token";
import { SESSION_COOKIE } from "@/lib/session";
import { lookupSession } from "@/lib/session-store";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages: unknown links get the 404 page with a real 404 status.
  // "/" always renders notFound(), so rewriting there serves the same page.
  if (pathname.startsWith("/p/")) {
    const token = pathname.slice("/p/".length);
    if (!(await isLiveToken(token))) return NextResponse.rewrite(new URL("/", request.url));
    return NextResponse.next();
  }

  // Admin: send visitors without a live session to the login page with a real redirect, before
  // anything renders. Pages, Server Actions and Route Handlers still check again (requireAdmin).
  if (pathname === "/admin/login") return NextResponse.next();
  if (!(await lookupSession(request.cookies.get(SESSION_COOKIE)?.value))) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/p/:token", "/admin", "/admin/:path*"],
};
