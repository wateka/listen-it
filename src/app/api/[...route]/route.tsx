/// <reference path="../../../../node_modules/@types/spotify-api/index.d.ts" />

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { tracks, users, appUsers, accounts } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import {
	getSpotifyToken,
	createPlaylist,
	addTrackToPlaylist,
	checkPlaylistExists,
	refreshSpotifyToken,
} from "@/spotify";

type HonoBinding = {
	Variables: {
		userId: string;
	};
};

async function getSpotifyTokenWithRefresh(userId: string) {
	const account = await db
		.select()
		.from(accounts)
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, "spotify")))
		.get();

	if (!account?.refresh_token) {
		throw new Error("Refresh token not found");
	}

	const {
		access_token,
		token_type,
		scope,
		expires_in,
		refresh_token: newRefreshToken,
	} = await refreshSpotifyToken(account.refresh_token);

	await db
		.update(accounts)
		.set({
			access_token: access_token,
			token_type: token_type,
			scope: scope,
			expires_at: Math.floor(Date.now() / 1000) + expires_in,
			refresh_token: newRefreshToken,
		})
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, "spotify")));

	return access_token;
}

const app = new Hono<HonoBinding>().basePath("/api");

app.use(async (c, next) => {
	if (c.req.path.startsWith("/api/users") && c.req.method === "GET") {
		return await next();
	}

	const session = await auth();
	if (!session?.user?.id) {
		return c.json("Not authenticated", 401);
	}
	c.set("userId", session.user.id);

	return await next();
});

const route = app
	.get("/init", async (c) => {
		const callbackUrl = c.req.param("callback") || "/home";

		const account = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.userId, c.var.userId),
					eq(accounts.provider, "spotify"),
				),
			)
			.get();

		const spotifyId = account?.providerAccountId;
		const token = account?.access_token;

		if (!spotifyId || !token) {
			return c.text("Account not found.", 404);
		}

		const appUser = await db
			.select()
			.from(appUsers)
			.where(eq(appUsers.id, c.var.userId))
			.get();

		if (appUser?.playlistSpotifyId) {
			const playlistId = appUser?.playlistSpotifyId;
			const existed = await checkPlaylistExists(playlistId, token);
			if (existed) {
				return c.redirect(callbackUrl);
			}
		}

		const playlistId = await createPlaylist(spotifyId, token);

		if (appUser === undefined) {
			await db.insert(appUsers).values({
				id: c.var.userId,
				userSpotifyId: account.providerAccountId,
				playlistSpotifyId: playlistId,
			});
		} else {
			await db
				.update(appUsers)
				.set({
					playlistSpotifyId: playlistId,
				})
				.where(eq(appUsers.id, c.var.userId))
				.run();
		}

		return c.redirect(callbackUrl);
	})
	.get("/search", async (c) => {
		const token = await getSpotifyToken();
		const q = encodeURIComponent(c.req.query("q") || "");

		const response = await fetch(
			`https://api.spotify.com/v1/search?q=${q}&type=track&limit=10&marker=JP`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		const data = (await response.json()) as SpotifyApi.TrackSearchResponse;
		return c.json(data.tracks.items.map(convertTrackItem));
	})
	.get("/me", async (c) => {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, c.var.userId))
			.get();

		return c.json(user!);
	})
	.put("/me/username", async (c) => {
		const { username } = (await c.req.json()) as {
			username: string;
		};

		await db
			.update(users)
			.set({ name: username })
			.where(eq(users.id, c.var.userId))
			.run();

		return c.json({ success: true });
	})
	.put("/me/image", async (c) => {
		const { imageUrl } = (await c.req.json()) as {
			imageUrl: string;
		};

		await db
			.update(users)
			.set({ image: imageUrl })
			.where(eq(users.id, c.var.userId))
			.run();

		return c.json({ success: true });
	})
	.get("/me/received-tracks", async (c) => {
		const tracks_res = await db
			.select()
			.from(tracks)
			.where(eq(tracks.toUserId, c.var.userId))
			.leftJoin(users, eq(users.id, tracks.fromUserId))
			.orderBy(desc(tracks.createdAt))
			.limit(10)
			.all();

		return c.json(
			tracks_res.map(({ track, user }) => ({
				...track,
				fromUserName: user?.name,
				fromUserImage: user?.image,
			})),
		);
	})
	.get("/me/last-sent-track", async (c) => {
		const toUserId = c.req.query("toUserId");

		if (toUserId === undefined) {
			return c.text("Received user not found", 400);
		}

		const latestTrack = await db
			.select()
			.from(tracks)
			.where(
				and(eq(tracks.fromUserId, c.var.userId), eq(tracks.toUserId, toUserId)),
			)
			.orderBy(desc(tracks.createdAt))
			.get();

		if (latestTrack === undefined) {
			return c.text("No track found.", 404);
		}

		return c.json(latestTrack);
	})
	.post("/me/playlist", async (c) => {
		const appUser = await db
			.select()
			.from(appUsers)
			.where(eq(appUsers.id, c.var.userId))
			.get();

		const token = await getSpotifyToken();

		if (appUser?.playlistSpotifyId) {
			const existed = await checkPlaylistExists(
				appUser.playlistSpotifyId,
				token,
			);
			if (existed) {
				return c.text("Playlist has already created.", 400);
			}
		}

		if (appUser?.userSpotifyId) {
			const playlistId = await createPlaylist(appUser.userSpotifyId, token);
			const _res = await db
				.update(appUsers)
				.set({
					playlistSpotifyId: playlistId,
				})
				.where(eq(appUsers.id, c.var.userId))
				.run();
			return c.json({ success: true });
		}

		return c.text("User's Spotify ID is not registered.", 404);
	})
	.put("/me/playlist/tracks", async (c) => {
		const appUser = await db
			.select()
			.from(appUsers)
			.where(eq(appUsers.id, c.var.userId))
			.get();

		if (!appUser?.playlistSpotifyId) {
			return c.text("Playlist not found", 404);
		}

		const unaddedTracks = await db
			.select()
			.from(tracks)
			.where(eq(tracks.addedToPlaylist, false))
			.all();

		const account = await db
			.select({ token: accounts.access_token })
			.from(accounts)
			.where(
				and(
					eq(accounts.userId, c.var.userId),
					eq(accounts.provider, "spotify"),
				),
			)
			.get();

		const token = account?.token;
		if (!token) {
			return c.text("Spotify access token undefined.", 400);
		}

		try {
			await addTrackToPlaylist(
				unaddedTracks.map(({ spotifyId }) => `spotify:track:${spotifyId}`),
				appUser.playlistSpotifyId,
				token,
			);
			const _res = await db
				.update(tracks)
				.set({ addedToPlaylist: true })
				.where(
					inArray(
						tracks.id,
						unaddedTracks.map(({ id }) => id),
					),
				)
				.run();
			return c.json({ success: true });
		} catch (error) {
			console.error(error);
			return c.text("Unable to add tracks to playlist.", 400);
		}
	})
	.get("/users/:id", async (c) => {
		const userId = c.req.param("id");
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.get();

		if (!user) {
			return c.json("User not found", 404);
		}

		return c.json(user);
	})
	.post("/users/:id/tracks", async (c) => {
		const toUserId = c.req.param("id");

		const body = await c.req.parseBody<{
			spotifyId: string;
			spotifyUrl: string;
			name: string;
			artistName: string;
			image: string;
		}>();

		let addedToPlaylist = false;

		/*
			プレイリストに追加する処理
		*/
		const toAppUser = await db
			.select()
			.from(appUsers)
			.where(eq(appUsers.id, toUserId))
			.get();

		if (toAppUser?.playlistSpotifyId) {
			const token = await getSpotifyTokenWithRefresh(toUserId);
			try {
				await addTrackToPlaylist(
					[`spotify:track:${body.spotifyId}`],
					toAppUser.playlistSpotifyId,
					token,
				);
				addedToPlaylist = true;
			} catch (error) {
				console.error(`Unable to add track to playlist: ${error}`);
			}
		}

		/*
			曲データのDBへの追加処理
		*/
		const _res = await db
			.insert(tracks)
			.values({
				spotifyId: body.spotifyId,
				spotifyUrl: body.spotifyUrl,
				name: body.name,
				artistName: body.artistName,
				image: body.image,
				fromUserId: c.var.userId,
				toUserId: toUserId,
				createdAt: new Date(),
				addedToPlaylist: addedToPlaylist,
			})
			.run();

		return c.json({ success: true });
	});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof route;

export type TrackItems = {
	spotifyId: string;
	spotifyUrl: string;
	name: string;
	artistName: string;
	image: string | null;
}[];

function convertTrackItem(item: SpotifyApi.TrackObjectFull): TrackItems[0] {
	return {
		spotifyId: item.id,
		spotifyUrl: item.external_urls.spotify,
		name: item.name,
		artistName: item.artists.map((artist) => artist.name).join(", "),
		image: item.album.images[0]?.url,
	};
}
