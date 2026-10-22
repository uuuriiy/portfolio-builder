import { generateCodeVerifier, generateState } from "arctic";
import { NextResponse, type NextRequest } from "next/server";
import { clientIp } from "@/lib/auth";
import {
  googleClient,
  googleConfigured,
  LOGIN_RATE_LIMIT,
  OAUTH_COOKIE_PATH,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/google";
import { rateLimit } from "@/lib/rate-limit";

// Step 1 of sign-in: send the browser to Google with a one-time state and PKCE verifier.
export async function GET(request: NextRequest) {
  const fail = (error: string) => NextResponse.redirect(new URL(`/admin/login?error=${error}`, request.url));

  if (!googleConfigured()) return fail("not_configured");
  const { limit, windowMs } = LOGIN_RATE_LIMIT;
  if (!(await rateLimit(`login:${clientIp(request.headers)}`, limit, windowMs))) return fail("rate_limited");

  const state = generateState();
  const verifier = generateCodeVerifier();
  const url = googleClient(request.nextUrl.origin).createAuthorizationURL(state, verifier, [
    "openid",
    "email",
    "profile",
  ]);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: OAUTH_COOKIE_PATH,
    maxAge: 10 * 60,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, state, cookie);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, cookie);
  return response;
}
