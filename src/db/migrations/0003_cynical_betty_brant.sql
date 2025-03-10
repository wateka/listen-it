PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_playlist` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_spotify_id` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_playlist`("id", "playlist_spotify_id") SELECT "id", "playlist_spotify_id" FROM `user_playlist`;--> statement-breakpoint
DROP TABLE `user_playlist`;--> statement-breakpoint
ALTER TABLE `__new_user_playlist` RENAME TO `user_playlist`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `user` ADD `spotify_id` text;