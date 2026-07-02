ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "solar_account_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "solar_profile" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "solar_profile_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN IF EXISTS "solar_user_id";--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN IF EXISTS "solar_username";--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN IF EXISTS "solar_display_name";
