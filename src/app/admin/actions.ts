"use server";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { db } from "@/db";
import { admins, adminSessions, developers, projects } from "@/db/schema";
import { endSession, requireAdmin } from "@/lib/auth";
import { adminEmailSchema, firstError, isUuid, parseDeveloperForm, parseProjectForm, type FormState } from "@/lib/forms";
import { generateAccessToken } from "@/lib/tokens";

// Every action below re-checks the session: Server Actions are public endpoints.

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// Admins and sessions

export async function addAdmin(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = adminEmailSchema.safeParse(form.get("email"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const inserted = await db
    .insert(admins)
    .values({ email: parsed.data })
    .onConflictDoNothing()
    .returning({ id: admins.id });
  if (!inserted.length) return { error: "That email already has access" };
  refresh();
  return { saved: true };
}

// Removing an admin also ends all of their sessions (cascade). Removing yourself is how you
// hand the panel over: it works only while another admin remains, and signs you out.
export async function removeAdmin(id: string) {
  const me = await requireAdmin();
  if (!isUuid(id)) return;

  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(admins);
  if (Number(total) <= 1) return;

  await db.delete(admins).where(eq(admins.id, id));
  if (id === me.id) {
    await endSession();
    redirect("/admin/login");
  }
  refresh();
}

export async function revokeSession(sessionId: string) {
  const me = await requireAdmin();
  if (!/^[0-9a-f]{64}$/.test(sessionId)) return;
  if (sessionId === me.sessionId) {
    await endSession();
    redirect("/admin/login");
  }
  await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  refresh();
}

// Signs out every other browser, for every admin. Use it if a device is lost or shared.
export async function signOutOtherSessions() {
  const me = await requireAdmin();
  await db.delete(adminSessions).where(ne(adminSessions.id, me.sessionId));
  refresh();
}

export async function createDeveloper(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseDeveloperForm(form);
  if (!parsed.success) return { error: firstError(parsed.error) };

  const [created] = await db
    .insert(developers)
    .values({ ...parsed.data, accessToken: generateAccessToken() })
    .returning({ id: developers.id });
  redirect(`/admin/developers/${created.id}`);
}

export async function updateDeveloper(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Developer not found" };
  const parsed = parseDeveloperForm(form);
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db
    .update(developers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(developers.id, id));
  refresh();
  return { saved: true };
}

export async function setPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  if (!isUuid(id)) return;
  await db.update(developers).set({ isPublished, updatedAt: new Date() }).where(eq(developers.id, id));
  refresh();
}

// Issues a new link. The old one stops working immediately.
export async function regenerateLink(id: string) {
  await requireAdmin();
  if (!isUuid(id)) return;
  await db
    .update(developers)
    .set({ accessToken: generateAccessToken(), updatedAt: new Date() })
    .where(eq(developers.id, id));
  refresh();
}

export async function deleteDeveloper(id: string) {
  await requireAdmin();
  if (!isUuid(id)) return;
  const items = await db
    .select({ image: projects.image, gallery: projects.gallery })
    .from(projects)
    .where(eq(projects.developerId, id));
  await db.delete(developers).where(eq(developers.id, id)); // projects cascade
  await deleteImages(items.flatMap((p) => [p.image, ...p.gallery]));
  redirect("/admin");
}

export async function saveProject(
  developerId: string,
  projectId: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(developerId) || (projectId && !isUuid(projectId))) return { error: "Not found" };
  const parsed = parseProjectForm(form);
  if (!parsed.success) return { error: firstError(parsed.error) };

  if (projectId) {
    const [existing] = await db
      .select({ image: projects.image, gallery: projects.gallery })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.developerId, developerId)));
    if (!existing) return { error: "Project not found" };

    await db
      .update(projects)
      .set(parsed.data)
      .where(and(eq(projects.id, projectId), eq(projects.developerId, developerId)));

    const kept = new Set([parsed.data.image, ...parsed.data.gallery]);
    await deleteImages([existing.image, ...existing.gallery].filter((u) => !kept.has(u)));
  } else {
    const [developer] = await db
      .select({ id: developers.id })
      .from(developers)
      .where(eq(developers.id, developerId));
    if (!developer) return { error: "Developer not found" };

    // New projects go to the top of the list.
    const [{ min }] = await db
      .select({ min: sql<number>`coalesce(min(${projects.sortOrder}), 0)` })
      .from(projects)
      .where(eq(projects.developerId, developerId));
    await db.insert(projects).values({ ...parsed.data, developerId, sortOrder: Number(min) - 1 });
  }

  await touchDeveloper(developerId);
  redirect(`/admin/developers/${developerId}`);
}

export async function deleteProject(developerId: string, projectId: string) {
  await requireAdmin();
  if (!isUuid(developerId) || !isUuid(projectId)) return;
  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.developerId, developerId)))
    .returning({ image: projects.image, gallery: projects.gallery });
  if (deleted) await deleteImages([deleted.image, ...deleted.gallery]);
  await touchDeveloper(developerId);
  refresh();
}

// Swap a project with its neighbour, then renumber so sort orders stay dense.
export async function moveProject(developerId: string, projectId: string, direction: "up" | "down") {
  await requireAdmin();
  if (!isUuid(developerId) || !isUuid(projectId)) return;

  const ordered = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.developerId, developerId))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  const ids = ordered.map((p) => p.id);
  const from = ids.indexOf(projectId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];

  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) {
      await tx.update(projects).set({ sortOrder: i }).where(eq(projects.id, id));
    }
  });
  await touchDeveloper(developerId);
  refresh();
}

async function touchDeveloper(id: string) {
  await db.update(developers).set({ updatedAt: new Date() }).where(eq(developers.id, id));
}

// Remove images from Vercel Blob once nothing references them any more.
async function deleteImages(urls: string[]) {
  const unique = [...new Set(urls.filter(Boolean))];
  if (!unique.length || !process.env.BLOB_READ_WRITE_TOKEN) return;

  const stillUsed = await db
    .select({ image: projects.image, gallery: projects.gallery })
    .from(projects);
  const used = new Set(stillUsed.flatMap((p) => [p.image, ...p.gallery]));
  const orphaned = unique.filter((u) => !used.has(u) && u.includes(".blob.vercel-storage.com/"));
  if (!orphaned.length) return;

  try {
    await del(orphaned);
  } catch (err) {
    console.error("Failed to delete images from Blob", err);
  }
}
