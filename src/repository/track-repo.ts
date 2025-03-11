import { and, eq, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { tracks, users } from "@/db/schema";

export async function getReceivedTracksByUserId(
	receiverUserId: string,
	limit: number,
) {
	return await db
		.select()
		.from(tracks)
		.leftJoin(users, eq(users.id, tracks.fromUserId))
		.where(eq(tracks.toUserId, receiverUserId))
		.orderBy(desc(tracks.createdAt))
		.limit(limit);
}

export async function getUnaddedTracksByUserId(userId: string, limit: number) {
	return await db
		.select()
		.from(tracks)
		.leftJoin(users, eq(users.id, tracks.fromUserId))
		.where(and(eq(tracks.toUserId, userId), eq(tracks.addedToPlaylist, false)))
		.orderBy(desc(tracks.createdAt))
		.limit(limit);
}

export async function getSentTracksByUserId(
	senderUserId: string,
	limit: number,
) {
	return await db
		.select()
		.from(tracks)
		.where(eq(tracks.fromUserId, senderUserId))
		.orderBy(desc(tracks.createdAt))
		.limit(limit);
}

export async function getLastSentTrackBySenderAndReceiverUserId(
	senderUserId: string,
	receiverUserId: string,
) {
	return await db
		.select()
		.from(tracks)
		.where(
			and(
				eq(tracks.fromUserId, senderUserId),
				eq(tracks.toUserId, receiverUserId),
			),
		)
		.orderBy(desc(tracks.createdAt))
		.limit(1)
		.get();
}

export async function updateTracksAsAddedToPlaylist(trackIds: string[]) {
	await db
		.update(tracks)
		.set({ addedToPlaylist: true })
		.where(inArray(tracks.spotifyId, trackIds));
}

export async function insertTrack(trackData: {
	spotifyId: string;
	spotifyUrl: string;
	name: string;
	artistName: string;
	image: string;
	fromUserId: string;
	toUserId: string;
	createdAt: Date;
	addedToPlaylist: boolean;
}) {
	await db.insert(tracks).values(trackData).run();
}
