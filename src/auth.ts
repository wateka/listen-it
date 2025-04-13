import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, users } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { logInWithCredential } from "./service/user-service";

export const { handlers, auth } = NextAuth(() => {
	return {
		session: {
			strategy: "database",
		},
		adapter: DrizzleAdapter(db),
		secret: process.env.AUTH_SECRET!,
		providers: [
			Google({
				clientId: process.env.AUTH_GOOGLE_ID!,
				clientSecret: process.env.AUTH_GOOGLE_SECRET!,
			}),
			Spotify({
				clientId: process.env.AUTH_SPOTIFY_ID!,
				clientSecret: process.env.AUTH_SPOTIFY_SECRET!,
				authorization:
					"https://accounts.spotify.com/authorize?scope=user-read-email%20playlist-modify-private",
			}),
			CredentialsProvider({
				id: "custom-credentials",
				name: "CustomCredentials",
				credentials: {
					email: { label: "Email", type: "text" },
					password: { label: "Password", type: "password" },
				},
				async authorize(credentials) {
					const { email, password } = credentials as {
						email: string;
						password: string;
					};
					if (!email || !password) return null;

					try {
						const user = await logInWithCredential(email, password);
						return {
							id: user.userId,
							email: user.email,
						};
					} catch (err) {
						console.error("Credential login failed:", err);
						return null;
					}
				},
			}),
		],
		callbacks: {
			async signIn({ user, account }) {
				if (!user.id) {
					console.error("UserId undefined");
					return false;
				}

				if (!account?.provider) {
					console.error("Account provider undefined");
					return false;
				}

				if (account.provider === "custom-credentials") {
					return true;
				}

				const userExistsOnDB_0or1 = await db.$count(
					users,
					eq(users.id, user.id),
				);
				if (userExistsOnDB_0or1 === 0) {
					// users テーブルに userId のレコードができていないため、
					// それを references する accounts テーブルのレコードも作れない。
					// ログインだけさせる。(accounts テーブルは nextauth で自動作成される。)
					//
					// (accounts テーブルのレコードの有無を直接確認しても良かったかも？)
					// (でも、それだと accounts が運悪く消えてた場合は更新されないのか)
					// (でも、それなら accounts のレコードの update はできなくない？)
					return true;
				}

				// nextauth が accounts テーブルを自動更新してくれないので、手動更新。
				await db
					.update(accounts)
					.set({
						access_token: account.access_token,
						expires_at: account.expires_at,
						id_token: account.id_token,
						refresh_token: account.refresh_token,
						// session_state: account.session_state,
						scope: account.scope,
					})
					.where(
						and(
							eq(accounts.provider, account?.provider),
							eq(accounts.providerAccountId, account.providerAccountId),
						),
					);

				return true;
			},
		},
	};
});
