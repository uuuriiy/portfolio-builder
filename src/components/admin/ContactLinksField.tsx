"use client";

import { useState } from "react";
import type { ContactLink } from "@/db/schema";
import { inputClass, secondaryButtonClass } from "./styles";

const MAX_LINKS = 10;

type Row = ContactLink & { key: number };

// Label + URL rows submitted as repeated "linkLabel" / "linkUrl" fields (parsed in lib/forms.ts).
export function ContactLinksField({ initial }: { initial: ContactLink[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((l, key) => ({ ...l, key })));
  const [nextKey, setNextKey] = useState(initial.length);

  const update = (key: number, patch: Partial<ContactLink>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <div className="text-sm">
      <span className="text-foreground/80">Extra links</span>
      <span className="mt-1 block text-xs text-muted">
        Optional buttons next to the contact button, e.g. LinkedIn, Behance or a CV.
      </span>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              name="linkLabel"
              value={row.label}
              onChange={(e) => update(row.key, { label: e.target.value })}
              placeholder="LinkedIn"
              aria-label="Link label"
              className={`${inputClass} mt-0 sm:w-48`}
            />
            <input
              name="linkUrl"
              value={row.url}
              onChange={(e) => update(row.key, { url: e.target.value })}
              placeholder="https://linkedin.com/in/…"
              aria-label="Link URL"
              className={`${inputClass} mt-0 flex-1`}
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
              className={secondaryButtonClass}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {rows.length < MAX_LINKS && (
        <button
          type="button"
          onClick={() => {
            setRows((rs) => [...rs, { key: nextKey, label: "", url: "" }]);
            setNextKey((k) => k + 1);
          }}
          className={`${secondaryButtonClass} mt-3`}
        >
          + Add link
        </button>
      )}
    </div>
  );
}
