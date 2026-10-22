ALTER TABLE "developers" ALTER COLUMN "cover_format" SET DEFAULT '4:3';--> statement-breakpoint
-- Client requirement: every portfolio uses 4:3 covers.
UPDATE "developers" SET "cover_format" = '4:3';
