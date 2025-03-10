PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_user` (
	`id` text PRIMARY KEY NOT NULL,
	`user_spotify_id` text,
	`playlist_spotify_id` text
);
--> statement-breakpoint
INSERT INTO `__new_app_user`("id", "user_spotify_id", "playlist_spotify_id") SELECT "id", "user_spotify_id", "playlist_spotify_id" FROM `app_user`;--> statement-breakpoint
DROP TABLE `app_user`;--> statement-breakpoint
ALTER TABLE `__new_app_user` RENAME TO `app_user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;