import { z } from "zod";
import type { ContactLink, Fact } from "@/db/schema";

export const isUuid = (value: string) => z.uuid().safeParse(value).success;

const text = (max = 200) => z.string().trim().max(max, `Text is too long (max ${max} characters)`);

const url = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//.test(v), "Must start with http:// or https://");

// Textarea helpers. The admin edits lists as plain text to keep the forms simple.
export const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

export const splitParagraphs = (value: string) =>
  value
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const splitComma = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// "Label: Value" per line
export const parseFacts = (value: string): Fact[] =>
  splitLines(value).flatMap((line) => {
    const i = line.indexOf(":");
    if (i <= 0) return [];
    return [{ label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() }];
  });

// "Label | https://url" per line
export const parseLinks = (value: string): ContactLink[] =>
  splitLines(value).flatMap((line) => {
    const [label, link] = line.split("|").map((s) => s.trim());
    if (!label || !link || !/^(https?:|mailto:)/.test(link)) return [];
    return [{ label, url: link }];
  });

export const formatFacts = (facts: Fact[]) => facts.map((f) => `${f.label}: ${f.value}`).join("\n");
export const formatLinks = (links: ContactLink[]) => links.map((l) => `${l.label} | ${l.url}`).join("\n");

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
};

export const developerSchema = z.object({
  internalLabel: text(),
  name: z.string().trim().min(1, "Name is required").max(120),
  role: text(),
  heroBadge: text(),
  heroTitleBefore: text(),
  heroTitleAccent: text(),
  heroTitleAfter: text(),
  heroSubtitle: text(600),
  bio: z.array(z.string().max(3000)).max(20),
  facts: z.array(z.object({ label: z.string().max(60), value: z.string().max(200) })).max(20),
  skills: z.array(z.string().max(60)).max(40),
  email: z.union([z.literal(""), z.email("Invalid email")]),
  contactTitle: text(),
  contactTitleAccent: text(),
  contactSubtitle: text(600),
  contactCta: text(60),
  contactLinks: z.array(z.object({ label: z.string().max(60), url: z.string().max(2000) })).max(10),
});

export function parseDeveloperForm(form: FormData) {
  return developerSchema.safeParse({
    internalLabel: field(form, "internalLabel"),
    name: field(form, "name"),
    role: field(form, "role"),
    heroBadge: field(form, "heroBadge"),
    heroTitleBefore: field(form, "heroTitleBefore"),
    heroTitleAccent: field(form, "heroTitleAccent"),
    heroTitleAfter: field(form, "heroTitleAfter"),
    heroSubtitle: field(form, "heroSubtitle"),
    bio: splitParagraphs(field(form, "bio")),
    facts: parseFacts(field(form, "facts")),
    skills: splitComma(field(form, "skills")),
    email: field(form, "email").trim(),
    contactTitle: field(form, "contactTitle"),
    contactTitleAccent: field(form, "contactTitleAccent"),
    contactSubtitle: field(form, "contactSubtitle"),
    contactCta: field(form, "contactCta"),
    contactLinks: parseLinks(field(form, "contactLinks")),
  });
}

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: text(5000),
  year: text(20),
  link: url,
  image: url,
  gallery: z.array(url).max(30),
  tags: z.array(z.string().max(60)).max(30),
  featured: z.boolean(),
});

export function parseProjectForm(form: FormData) {
  return projectSchema.safeParse({
    title: field(form, "title"),
    description: field(form, "description"),
    year: field(form, "year"),
    link: field(form, "link"),
    image: field(form, "image"),
    gallery: splitLines(field(form, "gallery")),
    tags: splitComma(field(form, "tags")),
    featured: form.get("featured") === "on",
  });
}

export const adminEmailSchema = z
  .string("Enter an email")
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"));

export type FormState = { error?: string; saved?: boolean } | undefined;

export const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input";
