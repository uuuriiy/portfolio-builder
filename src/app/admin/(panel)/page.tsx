import Link from "next/link";
import { regenerateLink, setPublished } from "@/app/admin/actions";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { ConfirmButton, PendingButton } from "@/components/admin/ui";
import { buttonClass, secondaryButtonClass } from "@/components/admin/styles";
import { listDevelopers } from "@/lib/data";

export const instant = false;

export default async function AdminHome() {
  const developers = await listDevelopers();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Developers</h1>
          <p className="mt-1 text-sm text-muted">
            Each portfolio has its own private link. Clients only see the page whose link you send them.
          </p>
        </div>
        <Link href="/admin/developers/new" className={buttonClass}>
          New developer
        </Link>
      </div>

      {developers.length === 0 ? (
        <p className="mt-16 text-center text-muted">No developers yet. Create the first portfolio.</p>
      ) : (
        <ul className="mt-10 space-y-3">
          {developers.map((dev) => {
            const path = `/p/${dev.accessToken}`;
            return (
              <li
                key={dev.id}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/developers/${dev.id}`} className="truncate font-medium hover:underline">
                      {dev.name}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        dev.isPublished ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-muted"
                      }`}
                    >
                      {dev.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {[dev.internalLabel, dev.role, `${dev.projectCount} projects`].filter(Boolean).join(" · ")}
                  </p>
                  {dev.isPublished && (
                    <a href={path} target="_blank" rel="noreferrer" className="mt-1 block truncate font-mono text-xs text-muted hover:text-foreground">
                      {path}
                    </a>
                  )}
                </div>
                {/* Same buttons in the same order on every row, so they line up down the list. */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap">
                  <CopyLinkButton path={path} disabled={!dev.isPublished} />
                  <form action={setPublished.bind(null, dev.id, !dev.isPublished)}>
                    <PendingButton className={`${secondaryButtonClass} min-w-[5.5rem]`}>
                      {dev.isPublished ? "Hide" : "Publish"}
                    </PendingButton>
                  </form>
                  <ConfirmButton
                    action={regenerateLink.bind(null, dev.id)}
                    title={`Create a new link for ${dev.name}?`}
                    message="Anyone with the current link will lose access immediately. You'll need to send the new link again."
                    confirmLabel="Create new link"
                    danger={false}
                    className={secondaryButtonClass}
                  >
                    New link
                  </ConfirmButton>
                  <Link href={`/admin/developers/${dev.id}`} className={secondaryButtonClass}>
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
