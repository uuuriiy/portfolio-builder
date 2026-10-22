"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CoverFormat } from "@/db/schema";

export type ProjectView = {
  title: string;
  description: string;
  year: string;
  link: string;
  image: string;
  gallery: string[];
  tags: string[];
};

const coverAspect: Record<CoverFormat, string> = {
  "16:10": "aspect-[16/10]",
  "4:3": "aspect-[4/3]",
};

export function ProjectCard({
  project,
  featured = false,
  coverFormat = "4:3",
}: {
  project: ProjectView;
  featured?: boolean;
  coverFormat?: CoverFormat;
}) {
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
            featured ? "aspect-[16/9] sm:aspect-[21/10]" : coverAspect[coverFormat]
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
  const photos = project.gallery.length ? project.gallery : project.image ? [project.image] : [];
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") scrollStrip(strip.current, -1);
      if (e.key === "ArrowRight") scrollStrip(strip.current, 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-panel relative z-10 flex h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl sm:overflow-hidden border border-line bg-card">
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
        {/* On phones the panel scrolls so long descriptions don't squeeze the photos;
            on larger screens the photos take whatever height the header leaves. */}
        <div className="relative h-[60vh] flex-none bg-background/40 sm:h-auto sm:min-h-0 sm:flex-1">
          {photos.length > 0 ? (
            <Gallery photos={photos} title={project.title} stripRef={strip} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted">Photos are coming soon</p>
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

// Scroll the strip by most of its width; snapping then lands on the next photo.
function scrollStrip(el: HTMLDivElement | null, direction: 1 | -1) {
  el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
}

// One horizontal strip for every gallery. Each photo is as tall as the strip allows, so phone
// screenshots sit side by side (like an app store listing) while wide shots fill the width one at a time.
function Gallery({
  photos,
  title,
  stripRef,
}: {
  photos: string[];
  title: string;
  stripRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  const update = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setEdges({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, [stripRef]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stripRef, update]);

  const arrow =
    "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/80 text-xl backdrop-blur transition hover:border-white/40 sm:flex";

  return (
    <>
      <div
        ref={stripRef}
        onScroll={update}
        className="flex h-full snap-x snap-mandatory scroll-px-4 items-center gap-4 overflow-x-auto overscroll-x-contain p-4 [justify-content:safe_center] sm:scroll-px-6 sm:p-6"
      >
        {photos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} ${i + 1}`}
            onLoad={update}
            className="h-auto max-h-full w-auto max-w-full flex-none snap-start rounded-xl"
          />
        ))}
      </div>
      {!edges.atStart && (
        <button
          type="button"
          onClick={() => scrollStrip(stripRef.current, -1)}
          aria-label="Previous photos"
          className={`${arrow} left-3`}
        >
          ‹
        </button>
      )}
      {!edges.atEnd && (
        <button
          type="button"
          onClick={() => scrollStrip(stripRef.current, 1)}
          aria-label="Next photos"
          className={`${arrow} right-3`}
        >
          ›
        </button>
      )}
    </>
  );
}
