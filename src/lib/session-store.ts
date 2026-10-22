import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, adminSessions } from "@/db/schema";
import { SESSION_IDLE_MS, SESSION_TOKEN_PATTERN } from "./session";

// Shared by proxy.ts and lib/auth.ts, so it must not import server-only or next/headers.

// Only write last_seen_at this often, so every click isn't a DB write.
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type SessionAdmin = { id: string; email: string; name: string; sessionId: string };

// Returns the admin behind a session cookie, or null if it's unknown, expired or idle too long.
// Expired rows are deleted; active ones have last_seen_at bumped (this is the idle timer).
export async function lookupSession(token: string | undefined): Promise<SessionAdmin | null> {
  if (!token || !SESSION_TOKEN_PATTERN.test(token)) return null;

  const sessionId = hashSessionToken(token);
  const [row] = await db
    .select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      expiresAt: adminSessions.expiresAt,
      lastSeenAt: adminSessions.lastSeenAt,
    })
    .from(adminSessions)
    .innerJoin(admins, eq(admins.id, adminSessions.adminId))
    .where(eq(adminSessions.id, sessionId))
    .limit(1);
  if (!row) return null;

  const now = Date.now();
  if (row.expiresAt.getTime() <= now || row.lastSeenAt.getTime() + SESSION_IDLE_MS <= now) {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
    return null;
  }
  if (now - row.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.update(adminSessions).set({ lastSeenAt: new Date(now) }).where(eq(adminSessions.id, sessionId));
  }

  return { id: row.id, email: row.email, name: row.name, sessionId };
}
