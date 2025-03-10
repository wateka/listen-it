ALTER TABLE `user_playlist` RENAME TO `app_user`;--> statement-breakpoint
CREATE TABLE `log` (
	`id` integer PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`endpoint` text NOT NULL,
	`level` text NOT NULL,
	`user_id` text NOT NULL,
	`client_ip_addr` text NOT NULL,
	`target_id` text,
	`target_type` text,
	`result` text NOT NULL,
	`message` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_user` (
	`id` text PRIMARY KEY NOT NULL,
	`user_spotify_id` text,
	`playlist_spotify_id` text,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_app_user`("id", "user_spotify_id", "playlist_spotify_id") SELECT "id", "user_spotify_id", "playlist_spotify_id" FROM `app_user`;--> statement-breakpoint
DROP TABLE `app_user`;--> statement-breakpoint
ALTER TABLE `__new_app_user` RENAME TO `app_user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `spotify_id`;