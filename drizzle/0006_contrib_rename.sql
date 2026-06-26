CREATE TABLE "contrib_cla_signature" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_user_id" integer NOT NULL,
	"github_username" text NOT NULL,
	"cla_version" text NOT NULL,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contrib_cla_signature_github_version_unique" UNIQUE("github_user_id","cla_version")
);
--> statement-breakpoint
ALTER TABLE "contrib_cla_signature" ADD CONSTRAINT "contrib_cla_signature_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contrib_cla_signature_user_idx" ON "contrib_cla_signature" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contrib_cla_signature_github_idx" ON "contrib_cla_signature" USING btree ("github_user_id");--> statement-breakpoint
CREATE INDEX "contrib_cla_signature_version_idx" ON "contrib_cla_signature" USING btree ("cla_version");--> statement-breakpoint
CREATE TABLE "contrib_github_stats" (
	"github_user_id" integer PRIMARY KEY NOT NULL,
	"github_username" text NOT NULL,
	"pr_count" integer DEFAULT 0 NOT NULL,
	"issue_count" integer DEFAULT 0 NOT NULL,
	"commit_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_manual_refresh" timestamp,
	"heatmap_data" text,
	"heatmap_updated_at" timestamp
);
