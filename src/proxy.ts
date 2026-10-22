import { NextResponse, type NextRequest } from "next/server";
import { isLiveToken } from "@/lib/live-token";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages: unknown links get the 404 page with a real 404 status.
  // "/" always renders notFound(), so rewriting there serves the same page.
  if (pathname.startsWith("/p/")) {
    const token = pathname.slice("/p/".length);
    if (!(await isLiveToken(token))) return NextResponse.rewrite(new URL("/", request.url));
    return NextResponse.next();
  }

  // Admin: redirect anonymous visitors to the login page. Pages and Server Actions
  // re-check the session themselves (requireAdmin); this is only the first gate.
  if (pathname === "/admin/login") return NextResponse.next();
  const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/p/:token", "/admin", "/admin/:path*"],
};
