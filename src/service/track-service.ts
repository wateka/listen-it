import { getSpotifyUserById } from "@/repository/spotify-user-repo";
import {
	getReceivedTracksByUserId,
	getSentTracksByUserId,
	getUnaddedTracksByUserId,
	getRecentSentUsersByUserId,
	insertTrack,
	getLastSentTrackBySenderAndReceiverUserId,
} from "@/repository/track-repo";
import { fetchSpotifyAccessTokenWithRefreshing } from "./account-service";
import { insertTracksToSpotifyPlaylist } from "@/repository/spotify-api";

// 受信トラック一覧（ページネーション用）
export async function fetchReceivedTracks(userId: string, limit: number, offset: number) {
	const rows = await getReceivedTracksByUserId(userId, limit, offset);
	return rows.map(({ track, user }) => ({
		...track,
		fromUserName: user?.name ?? "",
		fromUserImage: user?.image,
	}));
}

// 送信トラック一覧（ページネーション用）
export async function fetchSentTracks(userId: string, limit: number, offset: number) {
	const rows = await getSentTracksByUserId(userId, limit, offset);
	return rows.map(({ track, user }) => ({
		...track,
		toUserName: user?.name ?? "",
		toUserImage: user?.image,
	}));
}

// 未追加トラック一覧
export async function fetchUnaddedTracks(userId: string, limit: number) {
	return await getUnaddedTracksByUserId(userId, limit);
}

// 最近送ったユーザー一覧
export async function fetchRecentSentUsers(userId: string, limit: number) {
	const users = await getRecentSentUsersByUserId(userId, limit);
	return users.map((u) => ({
		id: u.toUserId,
		name: u.name ?? "",
		image: u.image,
	}));
}

// 送信者→受信者への最新1件取得
export async function fetchLastSentTrack(
	senderUserId: string,
	receiverUserId: string,
) {
	const track = await getLastSentTrackBySenderAndReceiverUserId(
		senderUserId,
		receiverUserId,
	);
	if (!track) {
		throw new Error("Last sent track not found");
	}
	return track;
}

// トラック追加
export async function addTrackToUser(
	senderUserId: string,
	receiverUserId: string,
	trackData: {
		spotifyId: string;
		spotifyUrl: string;
		name: string;
		artistName: string;
		image: string;
	},
) {
	const spotifyUser = await getSpotifyUserById(receiverUserId);

	let addedToPlaylist = false;
	if (spotifyUser) {
		try {
			const token = await fetchSpotifyAccessTokenWithRefreshing(receiverUserId);
			await insertTracksToSpotifyPlaylist(
				[`spotify:track:${trackData.spotifyId}`],
				spotifyUser.playlistSpotifyId,
				token,
			);
			addedToPlaylist = true;
		} catch (error) {
			console.error("Failed to add track to playlist", error);
		}
	}

	await insertTrack({
		...trackData,
		fromUserId: senderUserId,
		toUserId: receiverUserId,
		createdAt: new Date(),
		addedToPlaylist,
	});
}
