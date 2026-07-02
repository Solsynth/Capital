CREATE TABLE "contest_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"data" jsonb NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contest_submissions_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "contest_state" (
	"contest_id" text PRIMARY KEY NOT NULL,
	"phase" text DEFAULT 'dev' NOT NULL,
	"submission_enabled" boolean DEFAULT true NOT NULL,
	"voting_enabled" boolean DEFAULT false NOT NULL,
	"dev_ends_at" timestamp,
	"voting_ends_at" timestamp,
	"result_published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"user_id" text NOT NULL,
	"creativity" integer NOT NULL,
	"functionality" integer NOT NULL,
	"integration" integer NOT NULL,
	"is_positive" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contest_votes_submission_user_unique" UNIQUE("submission_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_votes_submission_id_contest_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."contest_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contest_submission_contest_id_idx" ON "contest_submissions" USING btree ("contest_id");--> statement-breakpoint
CREATE INDEX "contest_submission_user_id_idx" ON "contest_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contest_submission_status_idx" ON "contest_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contest_vote_submission_id_idx" ON "contest_votes" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "contest_vote_user_id_idx" ON "contest_votes" USING btree ("user_id");
