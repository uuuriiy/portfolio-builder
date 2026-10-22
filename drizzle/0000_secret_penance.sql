CREATE TABLE "developers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_token" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"internal_label" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"hero_badge" text DEFAULT '' NOT NULL,
	"hero_title_before" text DEFAULT '' NOT NULL,
	"hero_title_accent" text DEFAULT '' NOT NULL,
	"hero_title_after" text DEFAULT '' NOT NULL,
	"hero_subtitle" text DEFAULT '' NOT NULL,
	"bio" text[] DEFAULT '{}' NOT NULL,
	"facts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"contact_title" text DEFAULT '' NOT NULL,
	"contact_title_accent" text DEFAULT '' NOT NULL,
	"contact_subtitle" text DEFAULT '' NOT NULL,
	"contact_cta" text DEFAULT 'Contact with me' NOT NULL,
	"contact_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "developers_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"gallery" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_developer_id_idx" ON "projects" USING btree ("developer_id");