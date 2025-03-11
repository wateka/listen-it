import {
	getSpotifyAccountByUserId,
	updateSpotifyAccessToken,
} from "@/repository/account-repo";
import { getSpotifyAccessToken as getSpotifyAccessTokenData } from "@/repository/spotify-api";

export async function fetchSpotifyAccessTokenWithRefreshing(userId: string) {
	const spotifyAccount = await getSpotifyAccountByUserId(userId);

	if (!spotifyAccount) {
		throw new Error("Spotify account undefined.");
	}

	if (!spotifyAccount.refresh_token) {
		throw new Error("Spotify refresh token undefined.");
	}

	const tokenData = await getSpotifyAccessTokenData(
		spotifyAccount.refresh_token,
	);

	await updateSpotifyAccessToken(userId, {
		access_token: tokenData.access_token,
		token_type: tokenData.token_type,
		scope: tokenData.scope,
		expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
		refresh_token: tokenData.refresh_token,
	});

	return tokenData.access_token;
}
