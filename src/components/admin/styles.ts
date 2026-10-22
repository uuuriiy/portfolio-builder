// Shared admin class names. Kept out of ui.tsx ("use client") so Server Components get the
// actual strings: values imported from a client module arrive on the server as references.
export const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none transition focus:border-white/40";

export const buttonClass =
  "rounded-full bg-foreground px-5 py-2 text-sm font-medium text-black transition hover:bg-white/80 disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-white/40 disabled:opacity-50";

export const dangerButtonClass =
  "rounded-full border border-red-500/30 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50";
