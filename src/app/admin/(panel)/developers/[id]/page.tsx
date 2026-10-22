import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteDeveloper,
  deleteProject,
  moveProject,
  regenerateLink,
  setPublished,
  updateDeveloper,
} from "@/app/admin/actions";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { DeveloperForm } from "@/components/admin/DeveloperForm";
import { buttonClass, ConfirmButton, PendingButton, secondaryButtonClass } from "@/components/admin/ui";
import { getDeveloper, getDeveloperProjects } from "@/lib/data";

export const instant = false;

export default async function DeveloperPage({ params }: PageProps<"/admin/developers/[id]">) {
  const { id } = await params;
  const developer = await getDeveloper(id);
  if (!developer) notFound();
  const projects = await getDeveloperProjects(id);
  const path = `/p/${developer.accessToken}`;

  return (
    <>
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Developers
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">{developer.name}</h1>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Private link</h2>
        <p className="mt-3 break-all font-mono text-sm">
          {developer.isPublished ? (
            <a href={path} target="_blank" rel="noreferrer" className="hover:underline">
              {path}
            </a>
          ) : (
            <span className="text-muted">{path} (hidden: returns 404 until published)</span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {developer.isPublished && <CopyLinkButton path={path} />}
          <form action={setPublished.bind(null, developer.id, !developer.isPublished)}>
            <PendingButton className={secondaryButtonClass}>
              {developer.isPublished ? "Hide page" : "Publish page"}
            </PendingButton>
          </form>
          <ConfirmButton
            action={regenerateLink.bind(null, developer.id)}
            message="Create a new link? Anyone with the current link will lose access immediately."
            className={secondaryButtonClass}
          >
            Generate new link
          </ConfirmButton>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-medium tracking-tight">Projects</h2>
          <Link href={`/admin/developers/${developer.id}/projects/new`} className={buttonClass}>
            Add project
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No projects yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center gap-4 p-4">
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-background">
                  {project.image && <img src={project.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {project.title}
                    {project.featured && <span className="ml-2 text-xs text-muted">featured</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{project.year}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={moveProject.bind(null, developer.id, project.id, "up")}>
                    <PendingButton className={secondaryButtonClass} label="Move up">
                      ↑
                    </PendingButton>
                  </form>
                  <form action={moveProject.bind(null, developer.id, project.id, "down")}>
                    <PendingButton className={secondaryButtonClass} label="Move down">
                      ↓
                    </PendingButton>
                  </form>
                  <Link
                    href={`/admin/developers/${developer.id}/projects/${project.id}`}
                    className={secondaryButtonClass}
                  >
                    Edit
                  </Link>
                  <ConfirmButton
                    action={deleteProject.bind(null, developer.id, project.id)}
                    message={`Delete “${project.title}”?`}
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-medium tracking-tight">Profile</h2>
        <DeveloperForm
          action={updateDeveloper.bind(null, developer.id)}
          values={developer}
          submitLabel="Save profile"
        />
      </section>

      <section className="mt-12 rounded-2xl border border-red-500/30 p-6">
        <h2 className="font-medium text-red-400">Delete developer</h2>
        <p className="mt-1 text-sm text-muted">Removes the page, all of its projects and their images.</p>
        <div className="mt-4">
          <ConfirmButton
            action={deleteDeveloper.bind(null, developer.id)}
            message={`Delete ${developer.name} and all their projects? This cannot be undone.`}
          >
            Delete developer
          </ConfirmButton>
        </div>
      </section>
    </>
  );
}
