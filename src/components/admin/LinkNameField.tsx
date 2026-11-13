"use client";

import { useState } from "react";
import { portfolioPath, slugify } from "@/lib/links";
import { inputClass } from "./styles";

// Readable part of the public link with a live preview. Empty means "use the name".
export function LinkNameField({
  initial,
  name,
  publicKey,
}: {
  initial: string;
  name: string;
  publicKey?: string;
}) {
  const [value, setValue] = useState(initial);
  const slug = slugify(value) || slugify(name);

  return (
    <label className="block text-sm">
      <span className="text-foreground/80">Link name</span>
      <input
        name="slug"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={slugify(name) || "oleh-sypko"}
        className={inputClass}
      />
      <span className="mt-1 block text-xs text-muted">
        Readable part of the private link:{" "}
        <span className="break-all font-mono text-foreground/80">
          {portfolioPath({ slug, publicKey: publicKey ?? "xxxxxxxx" })}
        </span>
        . The random part at the end keeps the link private; changing the name doesn&apos;t break
        links you&apos;ve already sent.
      </span>
    </label>
  );
}
