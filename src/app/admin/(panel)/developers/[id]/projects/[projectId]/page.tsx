import Link from "next/link";
import { notFound } from "next/navigation";
import { saveProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getDeveloper, getProject } from "@/lib/data";

export const instant = false;

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/developers/[id]/projects/[projectId]">) {
  const { id, projectId } = await params;
  const [developer, project] = await Promise.all([getDeveloper(id), getProject(id, projectId)]);
  if (!developer || !project) notFound();

  return (
    <>
      <Link href={`/admin/developers/${id}`} className="text-sm text-muted hover:text-foreground">
        ← {developer.name}
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-medium tracking-tight">{project.title}</h1>
      <ProjectForm
        action={saveProject.bind(null, id, projectId)}
        values={project}
        submitLabel="Save project"
        uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </>
  );
}
