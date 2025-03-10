import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";

export const { handlers, auth } = NextAuth(() => {
	return {
		session: {
			strategy: "database",
		},
		adapter: DrizzleAdapter(db),
		providers: [
			Google({
				clientId: process.env.AUTH_GOOGLE_ID,
				clientSecret: process.env.AUTH_GOOGLE_SECRET,
			}),
			Spotify({
				clientId: process.env.AUTH_SPOTIFY_ID,
				clientSecret: process.env.AUTH_SPOTIFY_SECRET,
				authorization:
					"https://accounts.spotify.com/authorize?scope=user-read-email%20playlist-modify-private",
			}),
		],
		secret: process.env.AUTH_SECRET,
	};
});
