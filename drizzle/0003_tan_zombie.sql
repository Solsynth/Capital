CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`bucket` text NOT NULL,
	`url` text NOT NULL,
	`used_at` integer,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_key_unique` ON `files` (`key`);--> statement-breakpoint
CREATE INDEX `file_user_id_idx` ON `files` (`user_id`);--> statement-breakpoint
CREATE INDEX `file_key_idx` ON `files` (`key`);--> statement-breakpoint
ALTER TABLE `icp_identity` ADD `icon_file_id` text REFERENCES files(id);--> statement-breakpoint
ALTER TABLE `icp_site` ADD `icon_file_id` text REFERENCES files(id);