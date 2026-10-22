"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none transition focus:border-white/40";

export const buttonClass =
  "rounded-full bg-foreground px-5 py-2 text-sm font-medium text-black transition hover:bg-white/80 disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-white/40 disabled:opacity-50";

export const dangerButtonClass =
  "rounded-full border border-red-500/30 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-foreground/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  pending,
  className = buttonClass,
}: {
  children: ReactNode;
  pending: boolean;
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Saving…" : children}
    </button>
  );
}

// A small form that asks for confirmation before running a destructive action.
export function ConfirmButton({
  action,
  message,
  children,
  className = dangerButtonClass,
}: {
  action: () => Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <PendingButton className={className}>{children}</PendingButton>
    </form>
  );
}

export function PendingButton({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className: string;
  label?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-label={label} title={label}>
      {children}
    </button>
  );
}

// Runs a useActionState action without React's automatic form reset,
// so the admin's input survives a validation error.
export function useFormSubmit(formAction: (form: FormData) => void) {
  const [, startTransition] = useTransition();
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(() => formAction(form));
  };
}

export function FormMessage({ state }: { state: { error?: string; saved?: boolean } | undefined }) {
  if (state?.error) return <p className="text-sm text-red-400">{state.error}</p>;
  if (state?.saved) return <p className="text-sm text-emerald-400">Saved</p>;
  return null;
}
