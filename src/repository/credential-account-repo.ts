import { db } from "@/db";
import { accounts, credentialAccounts, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createCredentialUser(
	userId: string,
	email: string,
	hashedPassword: string,
	name?: string,
	image?: string,
) {
	await db.insert(users).values({
		id: userId,
		email,
		name,
		image,
	});

	await db.insert(credentialAccounts).values({
		email,
		hashedPassword,
		userId,
	});

	await db.insert(accounts).values({
		userId: userId,
		provider: "custom-credentials",
		providerAccountId: email,
		type: "email",
	});
}

export async function findCredentialAccountByEmail(email: string) {
	const [account] = await db
		.select()
		.from(credentialAccounts)
		.where(eq(credentialAccounts.email, email));

	return account ?? null;
}
