ALTER TABLE "contest_state" ADD COLUMN "status" text DEFAULT 'upcoming' NOT NULL;--> statement-breakpoint
ALTER TABLE "contest_state" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "contest_state" ADD COLUMN "end_date" timestamp;
