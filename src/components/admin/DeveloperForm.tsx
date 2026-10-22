"use client";

import { useActionState } from "react";
import type { DeveloperValues } from "@/lib/defaults";
import { formatFacts, formatLinks, type FormState } from "@/lib/forms";
import { Field, FormMessage, inputClass, SubmitButton, useFormSubmit } from "./ui";

export function DeveloperForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  values: DeveloperValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const onSubmit = useFormSubmit(formAction);

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <Section title="Basics">
        <Field label="Internal label" hint="Only visible to you in the admin panel, e.g. “Oleh — fintech clients”.">
          <input name="internalLabel" defaultValue={values.internalLabel} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input name="name" required defaultValue={values.name} className={inputClass} />
          </Field>
          <Field label="Role" hint="Shown in the browser tab and link previews.">
            <input name="role" defaultValue={values.role} placeholder="UX/UI Designer" className={inputClass} />
          </Field>
        </div>
        <Field label="Email" hint="Used by the “Get in touch” and contact buttons.">
          <input name="email" type="email" defaultValue={values.email} className={inputClass} />
        </Field>
      </Section>

      <Section title="Hero">
        <Field label="Badge" hint="Optional pill above the title, e.g. “Available for new projects”.">
          <input name="heroBadge" defaultValue={values.heroBadge} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Title start">
            <input name="heroTitleBefore" defaultValue={values.heroTitleBefore} placeholder="Designing" className={inputClass} />
          </Field>
          <Field label="Accent (italic)">
            <input name="heroTitleAccent" defaultValue={values.heroTitleAccent} placeholder="thoughtful" className={inputClass} />
          </Field>
          <Field label="Title end">
            <input
              name="heroTitleAfter"
              defaultValue={values.heroTitleAfter}
              placeholder="digital experiences"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Subtitle">
          <textarea name="heroSubtitle" rows={2} defaultValue={values.heroSubtitle} className={inputClass} />
        </Field>
      </Section>

      <Section title="About">
        <Field label="Facts" hint="One per line as “Label: Value”.">
          <textarea name="facts" rows={5} defaultValue={formatFacts(values.facts)} className={`${inputClass} font-mono`} />
        </Field>
        <Field label="Bio" hint="Separate paragraphs with an empty line.">
          <textarea name="bio" rows={7} defaultValue={values.bio.join("\n\n")} className={inputClass} />
        </Field>
        <Field label="Skills" hint="Comma-separated.">
          <input name="skills" defaultValue={values.skills.join(", ")} className={inputClass} />
        </Field>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <input name="contactTitle" defaultValue={values.contactTitle} className={inputClass} />
          </Field>
          <Field label="Heading accent (italic)">
            <input name="contactTitleAccent" defaultValue={values.contactTitleAccent} className={inputClass} />
          </Field>
        </div>
        <Field label="Subtitle">
          <input name="contactSubtitle" defaultValue={values.contactSubtitle} className={inputClass} />
        </Field>
        <Field label="Button text">
          <input name="contactCta" defaultValue={values.contactCta} className={inputClass} />
        </Field>
        <Field label="Extra links" hint="Optional, one per line as “Label | https://…”, e.g. “LinkedIn | https://linkedin.com/in/…”.">
          <textarea
            name="contactLinks"
            rows={3}
            defaultValue={formatLinks(values.contactLinks)}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </Section>

      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-line bg-card p-6">
      <legend className="px-1 text-sm uppercase tracking-[0.2em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}
