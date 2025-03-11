import { getSpotifyUserById } from "@/repository/spotify-user-repo";
import {
	getLastSentTrackBySenderAndReceiverUserId,
	getReceivedTracksByUserId,
	getUnaddedTracksByUserId,
	insertTrack,
} from "@/repository/track-repo";
import { fetchSpotifyAccessTokenWithRefreshing } from "./account-service";
import { insertTracksToSpotifyPlaylist } from "@/repository/spotify-api";

export async function fetchReceivedTracks(userId: string) {
	const LIMIT = 10;
	const tracks = await getReceivedTracksByUserId(userId, LIMIT);
	return tracks.map(({ track, user }) => ({
		...track,
		fromUserName: user?.name,
		fromUserImage: user?.image,
	}));
}

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

export async function fetchUnaddedTracks(userId: string) {
	const LIMIT = 30;
	const tracks = await getUnaddedTracksByUserId(userId, LIMIT);
	return tracks;
}

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
			// 追加できなかった場合も、sender からトラックの受付はするため、
			// throw error はせず、console errorのみにとどめる。
			// (receiver のエラーは sender には関係ないため、sender にはエラーを返さない)
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
