"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ProjectView = {
  title: string;
  description: string;
  year: string;
  link: string;
  image: string;
  gallery: string[];
  tags: string[];
};

export function ProjectCard({ project, featured = false }: { project: ProjectView; featured?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        className="group cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border border-line bg-card ${
            featured ? "aspect-[16/9] sm:aspect-[21/10]" : "aspect-[16/10]"
          }`}
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]">
              <span className="font-serif text-6xl italic text-muted">{project.title.charAt(0)}</span>
            </div>
          )}
          <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-lg opacity-0 backdrop-blur transition group-hover:opacity-100">
            +
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className={`font-medium ${featured ? "text-xl" : "text-lg"}`}>{project.title}</h3>
          {project.year && <span className="shrink-0 text-sm text-muted">{project.year}</span>}
        </div>
        {project.tags.length > 0 && <p className="mt-1 text-sm text-muted">{project.tags.join(" · ")}</p>}
      </article>
      {open && <ProjectModal project={project} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProjectModal({ project, onClose }: { project: ProjectView; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const photos = project.gallery.length ? project.gallery : project.image ? [project.image] : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (photos.length > 1 && e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
      if (photos.length > 1 && e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, photos.length]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-panel relative z-10 flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-card">
        <header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-xl font-medium">{project.title}</h3>
              {project.year && <span className="text-sm text-muted">{project.year}</span>}
            </div>
            {project.tags.length > 0 && <p className="mt-1 text-sm text-muted">{project.tags.join(" · ")}</p>}
            {project.description && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{project.description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-white/40 sm:block"
              >
                Open project ↗
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-white/40 hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="relative min-h-0 flex-1 bg-background/40">
          {photos.length > 0 ? (
            <img
              key={photos[index]}
              src={photos[index]}
              alt={`${project.title} ${index + 1}`}
              className="carousel-image h-full w-full object-contain p-4 sm:p-6"
            />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted">Photos are coming soon</p>
          )}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/80 text-xl backdrop-blur transition hover:border-white/40"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/80 text-xl backdrop-blur transition hover:border-white/40"
              >
                ›
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-background/80 px-3 py-1 text-xs text-muted backdrop-blur">
                {index + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="border-t border-line p-4 text-center text-sm transition hover:text-foreground sm:hidden"
          >
            Open project ↗
          </a>
        )}
      </div>
    </div>,
    document.body,
  );
}
