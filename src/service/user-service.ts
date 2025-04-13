import {
	getUserById,
	updateUserName,
	updateUserImage,
} from "@/repository/user-repo";

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
