import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { SESSION_COOKIE, SESSION_MAX_MS, SESSION_TOKEN_PATTERN } from "./session";
import { hashSessionToken, lookupSession, type SessionAdmin } from "./session-store";

export type CurrentAdmin = SessionAdmin;

// Looks the session cookie up in the database. Memoised per request.
// connection() keeps this (and its expiry clock check) out of prerendered/prefetched output.
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  await connection();
  return lookupSession((await cookies()).get(SESSION_COOKIE)?.value);
});

export async function isAdmin() {
  return Boolean(await getCurrentAdmin());
}

// Call at the top of every admin page, Server Action and Route Handler. Proxy only guards navigation.
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function startSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  await db.insert(adminSessions).values({
    id: hashSessionToken(token),
    adminId,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    ip: clientIp(h),
    expiresAt: new Date(Date.now() + SESSION_MAX_MS),
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_MS / 1000,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && SESSION_TOKEN_PATTERN.test(token)) {
    await db.delete(adminSessions).where(eq(adminSessions.id, hashSessionToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

// Vercel sets x-real-ip / x-forwarded-for to the visitor's address.
export function clientIp(h: Headers) {
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "").trim().slice(0, 64);
}
