ALTER TABLE "developers" ADD COLUMN "slug" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "developers" ADD COLUMN "public_key" text;--> statement-breakpoint
-- Readable part of existing links, from the developer's name (new ones are made in lib/links.ts).
UPDATE "developers" SET "slug" = trim(both '-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));--> statement-breakpoint
-- 8 random base62 characters per developer. Every character takes 16 random bits (bytes 0–1,
-- never the version/variant bytes) from its own gen_random_uuid(), which is CSPRNG-backed.
UPDATE "developers" d SET "public_key" = (
  SELECT string_agg(
    substr(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      (get_byte(u.bytes, 0) * 256 + get_byte(u.bytes, 1)) % 62 + 1,
      1
    ),
    '' ORDER BY n
  )
  FROM generate_series(1, 8) AS n
  CROSS JOIN LATERAL (SELECT uuid_send(gen_random_uuid()) AS bytes WHERE n > 0) u
  WHERE d.id IS NOT NULL
);--> statement-breakpoint
ALTER TABLE "developers" ALTER COLUMN "public_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "developers" ADD CONSTRAINT "developers_public_key_unique" UNIQUE("public_key");
