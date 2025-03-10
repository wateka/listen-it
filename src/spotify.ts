export async function getSpotifyToken() {
	const clientId = process.env.AUTH_SPOTIFY_ID;
	const clientSecret = process.env.AUTH_SPOTIFY_SECRET;

	const base64 = btoa(`${clientId}:${clientSecret}`);

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${base64}`,
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept-Language": "ja",
		},
		body: "grant_type=client_credentials",
	});

	const data = (await response.json()) as { access_token: string };
	return data.access_token;
}

export const refreshSpotifyToken = async (refreshToken: string) => {
	const clientId = process.env.AUTH_SPOTIFY_ID!;
	const clientSecret = process.env.AUTH_SPOTIFY_SECRET!;

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`"Failed to refresh access token": ${await response.text()}`,
		);
	}

	const data = (await response.json()) as {
		access_token: string;
		token_type: string;
		scope: string;
		expires_in: number;
		refresh_token: string;
	};
	return data;
};

export async function addTrackToPlaylist(
	trackIds: string[],
	playlistId: string,
	accessToken: string,
) {
	try {
		const response = await fetch(
			`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					uris: trackIds,
					position: 0,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to add track to playlist: ${response.status} ${await response.text()}`,
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error adding track to playlist:", error);
		throw error;
	}
}

export async function checkPlaylistExists(
	playlistId: string,
	accessToken: string,
): Promise<boolean> {
	try {
		const response = await fetch(
			`https://api.spotify.com/v1/playlists/${playlistId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		if (response.ok) {
			return true;
		}
		if (response.status === 404) {
			return false;
		}
		throw new Error(
			`Failed to check playlist existence: ${response.status} ${response.statusText}`,
		);
	} catch (error) {
		console.error("Error checking playlist existence:", error);
		return false; // Assume playlist doesn't exist in case of an error
	}
}

const playlistName = "Listen it! Playlist";
export async function createPlaylist(
	spotifyUserId: string,
	accessToken: string,
) {
	try {
		const response = await fetch(
			`https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: playlistName,
					public: false,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to create playlist: ${response.status} ${response.statusText}`,
			);
		}

		const data = (await response.json()) as { id: string };
		return data.id;
	} catch (error) {
		console.error("Error creating playlist:", error);
		throw error;
	}
}
