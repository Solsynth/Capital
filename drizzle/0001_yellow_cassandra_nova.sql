CREATE TABLE `icp_identity` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `icp_site` (
	`id` text PRIMARY KEY NOT NULL,
	`filling_no` text NOT NULL,
	`domain` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`site_url` text NOT NULL,
	`icon` text,
	`categories` text,
	`approved_at` integer,
	`identity_id` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`identity_id`) REFERENCES `icp_identity`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `icp_site_filling_no_unique` ON `icp_site` (`filling_no`);--> statement-breakpoint
CREATE INDEX `icp_site_filling_no_idx` ON `icp_site` (`filling_no`);--> statement-breakpoint
CREATE INDEX `icp_site_user_id_idx` ON `icp_site` (`user_id`);--> statement-breakpoint
CREATE TABLE `icp_submission` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`site_id` text,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`review_note` text,
	`reviewed_at` integer,
	`reviewed_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `icp_site`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `icp_submission_user_id_idx` ON `icp_submission` (`user_id`);--> statement-breakpoint
CREATE INDEX `icp_submission_status_idx` ON `icp_submission` (`status`);