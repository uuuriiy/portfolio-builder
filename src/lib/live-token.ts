import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { ACCESS_TOKEN_PATTERN } from "./tokens";

// Used by proxy.ts to answer unknown, hidden or revoked links with a real 404
// before the page starts streaming (a streamed notFound() can only send 200).
export async function isLiveToken(token: string) {
  if (!ACCESS_TOKEN_PATTERN.test(token)) return false;
  const [row] = await db
    .select({ id: developers.id })
    .from(developers)
    .where(and(eq(developers.accessToken, token), eq(developers.isPublished, true)))
    .limit(1);
  return Boolean(row);
}
