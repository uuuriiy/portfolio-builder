import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { parsePortfolioId, portfolioPath } from "./links";
import { ACCESS_TOKEN_PATTERN } from "./tokens";

export type LinkResolution = { kind: "ok" } | { kind: "redirect"; to: string } | { kind: "not-found" };

// Used by proxy.ts before anything renders, so unknown, hidden or revoked links get a real 404
// (a streamed notFound() can only send 200), and outdated URLs a real redirect:
//   /portfolio/<slug>-<key>  → ok, or redirect when the slug is no longer the current one
//   /p/<legacy token>        → redirect to the current /portfolio/… URL
export async function resolvePublicLink(pathname: string): Promise<LinkResolution> {
  const [, section, id = ""] = pathname.split("/");

  let where;
  if (section === "portfolio") {
    const parsed = parsePortfolioId(id);
    if (!parsed) return { kind: "not-found" };
    where = eq(developers.publicKey, parsed.key);
  } else if (section === "p" && ACCESS_TOKEN_PATTERN.test(id)) {
    where = eq(developers.accessToken, id);
  } else {
    return { kind: "not-found" };
  }

  const [row] = await db
    .select({ slug: developers.slug, publicKey: developers.publicKey })
    .from(developers)
    .where(and(where, eq(developers.isPublished, true)))
    .limit(1);
  if (!row) return { kind: "not-found" };

  const canonical = portfolioPath(row);
  return pathname === canonical ? { kind: "ok" } : { kind: "redirect", to: canonical };
}
