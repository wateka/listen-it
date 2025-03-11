import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";

export async function getSpotifyAccountByUserId(userId: string) {
	return await db
		.select()
		.from(accounts)
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, "spotify")))
		.get();
}

export async function updateSpotifyAccessToken(
	userId: string,
	tokenData: {
		access_token: string;
		token_type: string;
		scope: string;
		expires_at: number;
		refresh_token: string;
	},
) {
	await db
		.update(accounts)
		.set(tokenData)
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, "spotify")))
		.run();
}
