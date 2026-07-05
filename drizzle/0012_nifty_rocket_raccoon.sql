CREATE TABLE "product_releases" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"version" text NOT NULL,
	"released_at" timestamp NOT NULL,
	"title" text,
	"changelog" text DEFAULT '' NOT NULL,
	"download_url" text,
	"github_release_url" text,
	"github_release_id" text,
	"github_sync_status" text DEFAULT 'pending' NOT NULL,
	"github_sync_error" text,
	"minimum_version" text,
	"is_prerelease" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "release_slug_version_unique" UNIQUE("slug","version")
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text DEFAULT '' NOT NULL,
	"is_recommended" boolean,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_slug_user_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "release_slug_idx" ON "product_releases" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "release_released_at_idx" ON "product_releases" USING btree ("released_at");--> statement-breakpoint
CREATE INDEX "review_slug_idx" ON "product_reviews" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "review_user_id_idx" ON "product_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_status_idx" ON "product_reviews" USING btree ("status");