"use client";

import { useActionState, useEffect, useRef } from "react";
import { addAdmin } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormSubmit } from "./ui";

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState(addAdmin, undefined);
  const onSubmit = useFormSubmit(formAction);
  const ref = useRef<HTMLFormElement>(null);

  // Clear the field once the email was added; keep it on error so it can be fixed.
  useEffect(() => {
    if (state?.saved) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          name="email"
          type="email"
          required
          placeholder="name@gmail.com"
          aria-label="Google account email"
          className={`${inputClass} mt-0`}
        />
        <div className="mt-1.5 min-h-5">
          <FormMessage state={state?.saved ? undefined : state} />
        </div>
      </div>
      <SubmitButton pending={pending}>Add admin</SubmitButton>
    </form>
  );
}
