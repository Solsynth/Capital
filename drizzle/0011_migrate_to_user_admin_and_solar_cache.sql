ALTER TABLE "cla_signature" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "github_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cla_signature" CASCADE;--> statement-breakpoint
DROP TABLE "github_stats" CASCADE;--> statement-breakpoint
ALTER TABLE "contest_votes" DROP CONSTRAINT "contest_votes_submission_user_unique";--> statement-breakpoint
DROP INDEX "contrib_pending_check_repo_pr_unique";--> statement-breakpoint
ALTER TABLE "contrib_pending_check" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "contrib_pending_check_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "solar_account_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "solar_profile" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "solar_profile_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN "solar_user_id";--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN "solar_username";--> statement-breakpoint
ALTER TABLE "contrib_github_stats" DROP COLUMN "solar_display_name";--> statement-breakpoint
ALTER TABLE "contrib_pending_check" ADD CONSTRAINT "contrib_pending_check_repo_pr_unique" UNIQUE("repo_owner","repo_name","pr_number");--> statement-breakpoint
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_vote_submission_user_unique" UNIQUE("submission_id","user_id");