ALTER TABLE "github_stats" ADD COLUMN "issue_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "github_stats" ADD COLUMN "commit_count" integer DEFAULT 0 NOT NULL;