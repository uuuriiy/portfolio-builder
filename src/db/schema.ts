import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type Fact = { label: string; value: string };
export type ContactLink = { label: string; url: string };

export const developers = pgTable("developers", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Secret part of the public URL: /p/<accessToken>
  accessToken: text("access_token").notNull().unique(),
  isPublished: boolean("is_published").notNull().default(false),
  // Only shown in the admin panel
  internalLabel: text("internal_label").notNull().default(""),

  name: text("name").notNull(),
  role: text("role").notNull().default(""),

  heroBadge: text("hero_badge").notNull().default(""),
  heroTitleBefore: text("hero_title_before").notNull().default(""),
  heroTitleAccent: text("hero_title_accent").notNull().default(""),
  heroTitleAfter: text("hero_title_after").notNull().default(""),
  heroSubtitle: text("hero_subtitle").notNull().default(""),

  bio: text("bio").array().notNull().default([]),
  facts: jsonb("facts").$type<Fact[]>().notNull().default([]),
  skills: text("skills").array().notNull().default([]),

  email: text("email").notNull().default(""),
  contactTitle: text("contact_title").notNull().default(""),
  contactTitleAccent: text("contact_title_accent").notNull().default(""),
  contactSubtitle: text("contact_subtitle").notNull().default(""),
  contactCta: text("contact_cta").notNull().default("Contact with me"),
  contactLinks: jsonb("contact_links").$type<ContactLink[]>().notNull().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  developerId: uuid("developer_id")
    .notNull()
    .references(() => developers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  year: text("year").notNull().default(""),
  link: text("link").notNull().default(""),
  image: text("image").notNull().default(""),
  gallery: text("gallery").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("projects_developer_id_idx").on(t.developerId)]);

export type Developer = typeof developers.$inferSelect;
export type Project = typeof projects.$inferSelect;
