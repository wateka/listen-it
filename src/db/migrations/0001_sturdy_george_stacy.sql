ALTER TABLE `app_user` RENAME TO `spotify_user`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_spotify_user` (
	`id` text PRIMARY KEY NOT NULL,
	`user_spotify_id` text NOT NULL,
	`playlist_spotify_id` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_spotify_user`("id", "user_spotify_id", "playlist_spotify_id") SELECT "id", "user_spotify_id", "playlist_spotify_id" FROM `spotify_user`;--> statement-breakpoint
DROP TABLE `spotify_user`;--> statement-breakpoint
ALTER TABLE `__new_spotify_user` RENAME TO `spotify_user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;