/// <reference path="../../../../node_modules/@types/spotify-api/index.d.ts" />

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/auth";
import {
	fetchOrCreateUserPlaylistId,
	searchTracks,
} from "@/service/playlist-service";
import {
	changeUserImage,
	changeUserName,
	fetchUser,
} from "@/service/user-service";
import {
	addTrackToUser,
	fetchLastSentTrack,
	fetchReceivedTracks,
} from "@/service/track-service";

type HonoBinding = {
	Variables: {
		userId: string;
	};
};

const app = new Hono<HonoBinding>().basePath("/api");

app.use(async (c, next) => {
	if (c.req.path.startsWith("/api/users") && c.req.method === "GET") {
		return await next();
	}

	const session = await auth();
	if (!session?.user?.id) {
		console.log("Not authenticated, from app.use");
		return c.text("Not authenticated", 401);
	}
	c.set("userId", session.user.id);

	return await next();
});

const route = app
	.get("/init", async (c) => {
		const callbackUrl = c.req.param("callback") || "/home";

		try {
			const _playlistId = await fetchOrCreateUserPlaylistId(c.var.userId);
		} catch (error) {
			// エラーが出ても返す先が無いので、とりあえず握りつぶす
			if (error instanceof Error) {
				console.error(error.message);
			}
		}

		return c.redirect(callbackUrl);
	})
	.get("/search", async (c) => {
		const q = c.req.query("q");

		if (q === undefined) {
			return c.text("Search parameter not defined.", 400);
		}

		const tracks = await searchTracks(q);
		return c.json(tracks);
	})
	.get("/me", async (c) => {
		const user = await fetchUser(c.var.userId);
		return c.json(user);
	})
	.put("/me/username", async (c) => {
		const { username } = (await c.req.json()) as {
			username: string;
		};
		await changeUserName(c.var.userId, username);
		return c.json({ success: true });
	})
	.put("/me/image", async (c) => {
		const { imageUrl } = (await c.req.json()) as {
			imageUrl: string;
		};
		await changeUserImage(c.var.userId, imageUrl);
		return c.json({ success: true });
	})
	.get("/me/received-tracks", async (c) => {
		const tracks = await fetchReceivedTracks(c.var.userId);
		return c.json(tracks);
	})
	.get("/me/last-sent-track", async (c) => {
		const toUserId = c.req.query("toUserId");

		if (toUserId === undefined) {
			return c.text("Received user not found", 400);
		}

		try {
			const latestTrack = await fetchLastSentTrack(c.var.userId, toUserId);
			return c.json(latestTrack);
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw error;
		}
	})
	.post("/me/playlist", async (c) => {
		await fetchOrCreateUserPlaylistId(c.var.userId);
		return c.json({ success: true });
	})
	.get("/users/:id", async (c) => {
		const userId = c.req.param("id");
		const user = await fetchUser(userId);
		return c.json(user);
	})
	.post("/users/:id/tracks", async (c) => {
		const toUserId = c.req.param("id");

		const track = await c.req.parseBody<{
			spotifyId: string;
			spotifyUrl: string;
			name: string;
			artistName: string;
			image: string;
		}>();

		await addTrackToUser(c.var.userId, toUserId, track);
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
