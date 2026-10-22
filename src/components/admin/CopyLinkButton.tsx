"use client";

import { useState } from "react";
import { secondaryButtonClass } from "./styles";

export function CopyLinkButton({ path, disabled = false }: { path: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={secondaryButtonClass}
      disabled={disabled}
      title={disabled ? "Publish the page first" : undefined}
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
