import "server-only";
import { lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

// Fixed-window counter in Postgres: one atomic upsert per call, no extra service needed.
// Returns true while the caller is within `limit` hits per `windowMs`.
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const windowOpen = new Date(now.getTime() - windowMs);
  const expired = sql`${rateLimits.windowStart} < ${windowOpen}`;

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then ${now} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });

  // Occasionally drop counters nobody has touched for a day.
  if (Math.random() < 0.01) {
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(now.getTime() - 86_400_000)));
  }

  return row.count <= limit;
}
