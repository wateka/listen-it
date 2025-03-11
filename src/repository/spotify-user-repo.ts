import { eq } from "drizzle-orm";
import { db } from "@/db";
import { spotifyUser } from "@/db/schema";

export async function getSpotifyUserById(userId: string) {
	return await db
		.select()
		.from(spotifyUser)
		.where(eq(spotifyUser.id, userId))
		.get();
}

export async function insertSpotifyUser(values: {
	userId: string;
	spotifyId: string;
	playlistId: string;
}) {
	await db.insert(spotifyUser).values({
		id: values.userId,
		userSpotifyId: values.spotifyId,
		playlistSpotifyId: values.playlistId,
	});
}

export async function updateUserPlaylistId(userId: string, playlistId: string) {
	await db
		.update(spotifyUser)
		.set({ playlistSpotifyId: playlistId })
		.where(eq(spotifyUser.id, userId))
		.run();
}
