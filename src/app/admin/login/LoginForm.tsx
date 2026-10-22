"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { buttonClass, FormMessage, inputClass } from "@/components/admin/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-2xl border border-line bg-card p-8">
      <h1 className="text-2xl font-medium tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-muted">Enter the password to manage portfolios</p>
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Password"
        className={`${inputClass} mt-6`}
      />
      <div className="mt-3 min-h-5">
        <FormMessage state={state} />
      </div>
      <button type="submit" disabled={pending} className={`${buttonClass} mt-3 w-full py-2.5`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
