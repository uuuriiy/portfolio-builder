import Link from "next/link";
import { createDeveloper } from "@/app/admin/actions";
import { DeveloperForm } from "@/components/admin/DeveloperForm";
import { requireAdmin } from "@/lib/auth";
import { emptyDeveloper } from "@/lib/defaults";

export const instant = false;

export default async function NewDeveloperPage() {
  await requireAdmin();

  return (
    <>
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Developers
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-medium tracking-tight">New developer</h1>
      <DeveloperForm action={createDeveloper} values={emptyDeveloper} submitLabel="Create" />
    </>
  );
}
