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

// Google accounts allowed into /admin. Nothing secret is stored: Google proves the email.
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // always lowercase
  name: text("name").notNull().default(""),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per signed-in browser. The cookie holds a random token; only its SHA-256 is stored,
// so a database leak can't be replayed as a login. Deleting a row signs that browser out.
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(), // sha256(token), hex
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    userAgent: text("user_agent").notNull().default(""),
    ip: text("ip").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("admin_sessions_admin_id_idx").on(t.adminId)],
);

// Fixed-window counters for sign-in attempts, keyed by e.g. "login:<ip>".
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

export type Developer = typeof developers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Admin = typeof admins.$inferSelect;
