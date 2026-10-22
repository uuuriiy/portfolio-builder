import Link from "next/link";
import { notFound } from "next/navigation";
import { saveProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getDeveloper } from "@/lib/data";
import { emptyProject } from "@/lib/defaults";

export const instant = false;

export default async function NewProjectPage({ params }: PageProps<"/admin/developers/[id]/projects/new">) {
  const { id } = await params;
  const developer = await getDeveloper(id);
  if (!developer) notFound();

  return (
    <>
      <Link href={`/admin/developers/${id}`} className="text-sm text-muted hover:text-foreground">
        ← {developer.name}
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-medium tracking-tight">New project</h1>
      <ProjectForm
        action={saveProject.bind(null, id, null)}
        values={emptyProject}
        submitLabel="Create project"
        uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
        coverFormat={developer.coverFormat}
      />
    </>
  );
}
