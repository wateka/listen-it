import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { tracks, users } from "@/db/schema";

// 受信トラック一覧（ページネーション用）
export async function getReceivedTracksByUserId(
	receiverUserId: string,
	limit: number,
	offset: number,
) {
	return await db
		.select()
		.from(tracks)
		.leftJoin(users, eq(users.id, tracks.fromUserId))
		.where(eq(tracks.toUserId, receiverUserId))
		.orderBy(desc(tracks.createdAt))
		.limit(limit)
		.offset(offset);
}

// 送信トラック一覧（ページネーション用）
export async function getSentTracksByUserId(
	senderUserId: string,
	limit: number,
	offset: number,
) {
	return await db
		.select()
		.from(tracks)
		.leftJoin(users, eq(users.id, tracks.toUserId))
		.where(eq(tracks.fromUserId, senderUserId))
		.orderBy(desc(tracks.createdAt))
		.limit(limit)
		.offset(offset);
}

// 未追加トラック一覧
export async function getUnaddedTracksByUserId(userId: string, limit: number) {
	return await db
		.select()
		.from(tracks)
		.leftJoin(users, eq(users.id, tracks.fromUserId))
		.where(and(eq(tracks.toUserId, userId), eq(tracks.addedToPlaylist, false)))
		.orderBy(desc(tracks.createdAt))
		.limit(limit);
}

// 最近送ったユーザー一覧
export async function getRecentSentUsersByUserId(senderUserId: string, limit: number) {
	return await db
		.select({
			toUserId: tracks.toUserId,
			name: users.name,
			image: users.image,
			latestCreatedAt: tracks.createdAt,
		})
		.from(tracks)
		.innerJoin(users, eq(users.id, tracks.toUserId))
		.where(eq(tracks.fromUserId, senderUserId))
		.orderBy(desc(tracks.createdAt))
		.groupBy(tracks.toUserId)
		.limit(limit);
}

// 送信者・受信者ごとの最新1件取得
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

// トラック追加
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
