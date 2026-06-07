-- Drop NOT NULL on icp_identity.user_id and icp_site.user_id

-- icp_identity
CREATE TABLE `__new_icp_identity` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `type` text DEFAULT 'individual' NOT NULL,
  `description` text,
  `icon` text,
  `icon_file_id` text REFERENCES `files`(`id`) ON DELETE set null,
  `user_id` text REFERENCES `user`(`id`) ON DELETE cascade,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

INSERT INTO `__new_icp_identity`(`id`,`name`,`description`,`icon`,`created_at`,`updated_at`,`type`,`user_id`,`icon_file_id`)
  SELECT `id`,`name`,`description`,`icon`,`created_at`,`updated_at`,`type`,`user_id`,`icon_file_id` FROM `icp_identity`;

DROP TABLE `icp_identity`;
ALTER TABLE `__new_icp_identity` RENAME TO `icp_identity`;
CREATE INDEX `icp_identity_user_id_idx` ON `icp_identity` (`user_id`);

-- icp_site
CREATE TABLE `__new_icp_site` (
  `id` text PRIMARY KEY NOT NULL,
  `filling_no` text NOT NULL UNIQUE,
  `domain` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `site_url` text NOT NULL,
  `icon` text,
  `icon_file_id` text REFERENCES `files`(`id`) ON DELETE set null,
  `categories` text,
  `approved_at` integer,
  `identity_id` text REFERENCES `icp_identity`(`id`),
  `user_id` text REFERENCES `user`(`id`) ON DELETE cascade,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

INSERT INTO `__new_icp_site`(`id`,`filling_no`,`domain`,`name`,`description`,`site_url`,`icon`,`icon_file_id`,`categories`,`approved_at`,`identity_id`,`user_id`,`created_at`,`updated_at`)
  SELECT `id`,`filling_no`,`domain`,`name`,`description`,`site_url`,`icon`,`icon_file_id`,`categories`,`approved_at`,`identity_id`,`user_id`,`created_at`,`updated_at` FROM `icp_site`;

DROP TABLE `icp_site`;
ALTER TABLE `__new_icp_site` RENAME TO `icp_site`;
CREATE INDEX `icp_site_filling_no_idx` ON `icp_site` (`filling_no`);
CREATE INDEX `icp_site_user_id_idx` ON `icp_site` (`user_id`);
