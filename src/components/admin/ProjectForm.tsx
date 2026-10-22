"use client";

import { useActionState, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { ProjectValues } from "@/lib/defaults";
import type { FormState } from "@/lib/forms";
import { Field, FormMessage, inputClass, secondaryButtonClass, SubmitButton, useFormSubmit } from "./ui";

async function uploadImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const blob = await upload(`portfolio/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}

export function ProjectForm({
  action,
  values,
  submitLabel,
  uploadsEnabled,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  values: ProjectValues;
  submitLabel: string;
  uploadsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const onSubmit = useFormSubmit(formAction);
  const [image, setImage] = useState(values.image);
  const [gallery, setGallery] = useState(values.gallery);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(files: FileList | null, target: "cover" | "gallery") {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await Promise.all([...files].map(uploadImage));
      if (target === "cover") setImage(urls[0]);
      else setGallery((g) => [...g, ...urls]);
    } catch (err) {
      setUploadError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  const move = (from: number, to: number) =>
    setGallery((g) => {
      if (to < 0 || to >= g.length) return g;
      const next = [...g];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Field label="Title *">
          <input name="title" required defaultValue={values.title} className={inputClass} />
        </Field>
        <Field label="Year">
          <input name="year" defaultValue={values.year} className={inputClass} />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={6} defaultValue={values.description} className={inputClass} />
      </Field>
      <Field label="Link" hint="Optional “Open project” URL.">
        <input name="link" type="url" defaultValue={values.link} placeholder="https://" className={inputClass} />
      </Field>
      <Field label="Tags" hint="Comma-separated.">
        <input name="tags" defaultValue={values.tags.join(", ")} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" defaultChecked={values.featured} />
        Featured: show as a wide card spanning both columns
      </label>

      <div className="space-y-3">
        <p className="text-sm text-foreground/80">Cover image</p>
        <input type="hidden" name="image" value={image} />
        {image && (
          <div className="relative w-64 overflow-hidden rounded-xl border border-line">
            <img src={image} alt="" className="aspect-[16/10] w-full object-cover" />
          </div>
        )}
        <div className="flex gap-3">
          <label className={`${secondaryButtonClass} ${uploadsEnabled ? "cursor-pointer" : "pointer-events-none opacity-50"}`}>
            {image ? "Replace" : "Upload"}
            <input
              type="file"
              disabled={!uploadsEnabled}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, "cover")}
            />
          </label>
          {image && (
            <button type="button" onClick={() => setImage("")} className={secondaryButtonClass}>
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-foreground/80">
          Gallery <span className="text-muted">(shown in the project modal; falls back to the cover)</span>
        </p>
        <input type="hidden" name="gallery" value={gallery.join("\n")} />
        {gallery.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((url, i) => (
              <li key={url} className="overflow-hidden rounded-xl border border-line bg-background">
                <img src={url} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="flex justify-between px-2 py-1.5 text-xs text-muted">
                  <span className="flex gap-2">
                    <button type="button" onClick={() => move(i, i - 1)} aria-label="Move left">
                      ←
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} aria-label="Move right">
                      →
                    </button>
                  </span>
                  <button
                    type="button"
                    onClick={() => setGallery((g) => g.filter((_, j) => j !== i))}
                    className="text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label
          className={`${secondaryButtonClass} inline-block ${uploadsEnabled ? "cursor-pointer" : "pointer-events-none opacity-50"}`}
        >
          Add photos
          <input
            type="file"
            disabled={!uploadsEnabled}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, "gallery")}
          />
        </label>
      </div>

      {!uploadsEnabled && (
        <p className="text-sm text-amber-300">
          Image uploads are off: set BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob) and restart the server.
        </p>
      )}
      {uploading && <p className="text-sm text-muted">Uploading…</p>}
      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}

      <div className="flex items-center gap-4">
        <SubmitButton pending={pending || uploading}>{submitLabel}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
