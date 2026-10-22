import { decodeIdToken } from "arctic";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { clientIp, startSession } from "@/lib/auth";
import {
  googleClient,
  googleConfigured,
  LOGIN_RATE_LIMIT,
  OAUTH_COOKIE_PATH,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/google";
import { rateLimit } from "@/lib/rate-limit";

type GoogleClaims = {
  iss: string;
  aud: string;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

// Step 2 of sign-in: Google sends the browser back here with a one-time code.
export async function GET(request: NextRequest) {
  const store = await cookies();
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = store.get(OAUTH_VERIFIER_COOKIE)?.value;
  // One-time values: clear them whatever happens next.
  store.delete({ name: OAUTH_STATE_COOKIE, path: OAUTH_COOKIE_PATH });
  store.delete({ name: OAUTH_VERIFIER_COOKIE, path: OAUTH_COOKIE_PATH });

  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));
  const fail = (error: string) => go(`/admin/login?error=${error}`);

  if (!googleConfigured()) return fail("not_configured");
  const { limit, windowMs } = LOGIN_RATE_LIMIT;
  if (!(await rateLimit(`login:${clientIp(request.headers)}`, limit, windowMs))) return fail("rate_limited");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (request.nextUrl.searchParams.get("error")) return fail("cancelled");
  if (!code || !state || !expectedState || !verifier || state !== expectedState) return fail("expired");

  let claims: GoogleClaims;
  try {
    const tokens = await googleClient(request.nextUrl.origin).validateAuthorizationCode(code, verifier);
    // The ID token comes straight from Google's token endpoint over TLS in exchange for our
    // client secret, so its signature doesn't need re-checking (OpenID Connect Core 3.1.3.7).
    claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
  } catch (err) {
    console.error("Google sign-in failed", err);
    return fail("failed");
  }

  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (!issuerOk || claims.aud !== process.env.GOOGLE_CLIENT_ID || claims.exp * 1000 < Date.now()) {
    return fail("failed");
  }
  if (!claims.email || claims.email_verified !== true) return fail("not_allowed");

  const email = claims.email.toLowerCase();
  const [admin] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin) return fail("not_allowed");

  await db
    .update(admins)
    .set({ lastLoginAt: new Date(), ...(claims.name ? { name: claims.name } : {}) })
    .where(eq(admins.id, admin.id));
  await startSession(admin.id);
  return go("/admin");
}
