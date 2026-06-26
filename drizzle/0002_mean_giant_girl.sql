CREATE TABLE "github_stats" (
	"github_user_id" integer PRIMARY KEY NOT NULL,
	"github_username" text NOT NULL,
	"pr_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
