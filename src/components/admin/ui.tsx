"use client";

import { useRef, useTransition, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, dangerButtonClass, secondaryButtonClass } from "./styles";


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

// A button that asks for confirmation in a modal before running an action
// (deleting, issuing a new link, signing out a session…).
export function ConfirmButton({
  action,
  message,
  title = "Are you sure?",
  confirmLabel,
  danger = true,
  children,
  className = dangerButtonClass,
}: {
  action: () => Promise<void>;
  message: string;
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      await action();
      dialog.current?.close();
    });

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={dialog}
        onCancel={(e) => pending && e.preventDefault()}
        // Clicks on the backdrop land on the <dialog> itself; clicks on the card land on its children.
        onClick={(e) => e.target === e.currentTarget && !pending && dialog.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-card p-0 text-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => dialog.current?.close()}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirm}
              className={
                danger
                  ? "rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
                  : `${buttonClass} py-1.5`
              }
            >
              {pending ? "Working…" : (confirmLabel ?? children)}
            </button>
          </div>
        </div>
      </dialog>
    </>
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
