ALTER TABLE `icp_identity` ADD `type` text DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE `icp_identity` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `icp_identity_user_id_idx` ON `icp_identity` (`user_id`);