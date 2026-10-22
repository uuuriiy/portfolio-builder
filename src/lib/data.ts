import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { developers, projects } from "@/db/schema";
import { ACCESS_TOKEN_PATTERN } from "./tokens";
import { requireAdmin } from "./auth";
import { isUuid } from "./forms";

const projectOrder = [asc(projects.sortOrder), desc(projects.createdAt)];

// Public: the only way a client can reach a developer is by their exact token.
// Wrapped in cache() so generateMetadata and the page share one query per request.
export const getPublicPortfolio = cache(async (token: string) => {
  if (!ACCESS_TOKEN_PATTERN.test(token)) return null;

  const [developer] = await db
    .select()
    .from(developers)
    .where(and(eq(developers.accessToken, token), eq(developers.isPublished, true)))
    .limit(1);
  if (!developer) return null;

  const items = await db
    .select()
    .from(projects)
    .where(eq(projects.developerId, developer.id))
    .orderBy(...projectOrder);

  // Strip admin-only fields before anything reaches the page.
  const { accessToken, internalLabel, ...profile } = developer;
  return { profile, projects: items };
});

export type PublicPortfolio = NonNullable<Awaited<ReturnType<typeof getPublicPortfolio>>>;

// Admin queries: each one checks the session itself.

export async function listDevelopers() {
  await requireAdmin();
  return db
    .select({
      id: developers.id,
      name: developers.name,
      role: developers.role,
      internalLabel: developers.internalLabel,
      accessToken: developers.accessToken,
      isPublished: developers.isPublished,
      updatedAt: developers.updatedAt,
      projectCount: count(projects.id),
    })
    .from(developers)
    .leftJoin(projects, eq(projects.developerId, developers.id))
    .groupBy(developers.id)
    .orderBy(desc(developers.updatedAt));
}

export async function getDeveloper(id: string) {
  await requireAdmin();
  if (!isUuid(id)) return null;
  const [developer] = await db.select().from(developers).where(eq(developers.id, id)).limit(1);
  return developer ?? null;
}

export async function getDeveloperProjects(developerId: string) {
  await requireAdmin();
  if (!isUuid(developerId)) return [];
  return db
    .select()
    .from(projects)
    .where(eq(projects.developerId, developerId))
    .orderBy(...projectOrder);
}

export async function getProject(developerId: string, projectId: string) {
  await requireAdmin();
  if (!isUuid(developerId) || !isUuid(projectId)) return null;
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.developerId, developerId)))
    .limit(1);
  return project ?? null;
}
