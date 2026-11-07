ALTER TABLE "product_reviews" ADD COLUMN IF NOT EXISTS "reply" text;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD COLUMN IF NOT EXISTS "reply_by" text;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD COLUMN IF NOT EXISTS "reply_at" timestamp;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_reply_by_user_id_fk" FOREIGN KEY ("reply_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
