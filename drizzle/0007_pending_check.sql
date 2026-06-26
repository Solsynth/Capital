CREATE TABLE "contrib_pending_check" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contrib_pending_check_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"github_username" text NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text NOT NULL,
	"pr_number" integer NOT NULL,
	"sha" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contrib_pending_check_username_idx" ON "contrib_pending_check" USING btree ("github_username");--> statement-breakpoint
CREATE INDEX "contrib_pending_check_status_idx" ON "contrib_pending_check" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "contrib_pending_check_repo_pr_unique" ON "contrib_pending_check" USING btree ("repo_owner","repo_name","pr_number");
