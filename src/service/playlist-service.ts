import {
	getSpotifyUserById,
	insertSpotifyUser,
	updateUserPlaylistId,
} from "@/repository/spotify-user-repo";
import { fetchSpotifyAccessTokenWithRefreshing } from "./account-service";
import { spotifyUser } from "@/db/schema";
import { getSpotifyAccountByUserId } from "@/repository/account-repo";
import {
	checkPlaylistExists,
	getSpotifyClientToken,
	getSpotifyTracks,
	insertSpotifyPlaylist,
} from "@/repository/spotify-api";

export async function fetchOrCreateUserPlaylistId(targetUserId: string) {
	const targetSpotifyUser = await getSpotifyUserById(targetUserId);

	if (targetSpotifyUser) {
		// playlist が登録されていても、有効かどうか不明なため確かめる
		const accessToken =
			await fetchSpotifyAccessTokenWithRefreshing(targetUserId);

		const exists = await checkPlaylistExists(
			targetSpotifyUser.playlistSpotifyId,
			accessToken,
		);
		// 有効であれば、現在の ID を返す
		if (exists) {
			return spotifyUser.playlistSpotifyId;
		}
		// 無効であれば、プレイリストを作成し、DB に保存
		const accessToken2 =
			await fetchSpotifyAccessTokenWithRefreshing(targetUserId);
		const newPlaylistId = await insertSpotifyPlaylist(
			targetSpotifyUser.userSpotifyId,
			accessToken2,
		);

		await updateUserPlaylistId(targetUserId, newPlaylistId);

		return newPlaylistId;
	}

	// spotifyUser が登録されていなければ、
	// このユーザが spotifyUser かどうか確認してから新規作成
	const spotifyAccount = await getSpotifyAccountByUserId(targetUserId);

	if (!spotifyAccount) {
		throw new Error("Target user is not spotify user.");
	}

	const accessToken = await fetchSpotifyAccessTokenWithRefreshing(targetUserId);
	const newPlaylistId = await insertSpotifyPlaylist(
		spotifyAccount.providerAccountId,
		accessToken,
	);
	await insertSpotifyUser({
		userId: targetUserId,
		spotifyId: spotifyAccount.providerAccountId,
		playlistId: newPlaylistId,
	});

	return newPlaylistId;
}

export async function searchTracks(query: string) {
	const token = await getSpotifyClientToken();
	const tracks = await getSpotifyTracks(query, token);
	return tracks.map((track) => ({
		spotifyId: track.id,
		spotifyUrl: track.external_urls.spotify,
		name: track.name,
		artistName: track.artists.map((artist) => artist.name).join(", "),
		image: track.album.images[0]?.url,
	}));
}
