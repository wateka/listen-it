import {
	getUserById,
	updateUserName,
	updateUserImage,
} from "@/repository/user-repo";
import {
	createCredentialUser,
	findCredentialAccountByEmail,
} from "@/repository/credential-account-repo";
import bcrypt from "bcryptjs";

export async function fetchUser(userId: string) {
	const user = await getUserById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	return {
		id: user.id,
		name: user.name || "Name Undefined",
		image: user.image || "No Image",
	};
}

export async function changeUserName(userId: string, username: string) {
	if (!username.trim()) {
		throw new Error("Username cannot be empty");
	}
	await updateUserName(userId, username);
}

export async function changeUserImage(userId: string, imageUrl: string) {
	if (!imageUrl.trim()) {
		throw new Error("Image URL cannot be empty");
	}
	await updateUserImage(userId, imageUrl);
}

export async function createUserWithCredential(
	email: string,
	plainPassword: string,
	name?: string,
	image?: string,
) {
	if (!email || !plainPassword) {
		throw new Error("Email and password cannot be empty");
	}

	const userId = crypto.randomUUID();
	const hashedPassword = await bcrypt.hash(plainPassword, 10);
	await createCredentialUser(userId, email, hashedPassword, name, image);
	return { id: userId, email };
}

export async function logInWithCredential(
	email: string,
	plainPassword: string,
) {
	if (!email || !plainPassword) {
		throw new Error("Email and password cannot be empty");
	}

	const account = await findCredentialAccountByEmail(email);
	if (!account) {
		throw new Error("Account not found");
	}

	const isValid = await bcrypt.compare(plainPassword, account.hashedPassword);
	if (!isValid) {
		throw new Error("Invalid password");
	}

	return { userId: account.userId, email: account.email };
}
