import { NextResponse, type NextRequest } from "next/server";
import { resolvePublicLink } from "@/lib/public-link";
import { SESSION_COOKIE } from "@/lib/session";
import { lookupSession } from "@/lib/session-store";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages. Unknown links get the 404 page with a real 404 status ("/" always renders
  // notFound(), so rewriting there serves the same page); old /p/<token> links and outdated
  // slugs are permanently redirected to the current /portfolio/<slug>-<key>.
  if (pathname.startsWith("/portfolio/") || pathname.startsWith("/p/")) {
    const link = await resolvePublicLink(pathname);
    if (link.kind === "not-found") return NextResponse.rewrite(new URL("/", request.url));
    if (link.kind === "redirect") return NextResponse.redirect(new URL(link.to, request.url), 308);
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
  matcher: ["/portfolio/:id", "/p/:token", "/admin", "/admin/:path*"],
};
