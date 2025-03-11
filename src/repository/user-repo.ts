import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getUserById(userId: string) {
	return await db.select().from(users).where(eq(users.id, userId)).get();
}

export async function updateUserName(userId: string, username: string) {
	await db.update(users).set({ name: username }).where(eq(users.id, userId));
}

export async function updateUserImage(userId: string, imageUrl: string) {
	await db.update(users).set({ image: imageUrl }).where(eq(users.id, userId));
}
