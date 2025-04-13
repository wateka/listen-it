import {
	sqliteTable,
	text,
	integer,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "@auth/core/adapters";

export const tracks = sqliteTable("track", {
	id: integer("id").primaryKey(),
	spotifyId: text("spotify_id").notNull(),
	spotifyUrl: text("spotify_url").notNull(),
	name: text("name").notNull(),
	artistName: text("artist_name").notNull(),
	image: text("image"),
	fromUserId: text("from_user_id")
		.notNull()
		.references(() => users.id),
	toUserId: text("to_user_id")
		.notNull()
		.references(() => users.id),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	addedToPlaylist: integer("added_to_playlist", { mode: "boolean" })
		.notNull()
		.default(false),
});

export const spotifyUser = sqliteTable("spotify_user", {
	id: text("id")
		.primaryKey()
		.references(() => users.id),
	userSpotifyId: text("user_spotify_id").notNull(),
	playlistSpotifyId: text("playlist_spotify_id").notNull(),
});

export const logs = sqliteTable("log", {
	id: integer("id").primaryKey(),
	eventId: text("event_id").notNull(),
	eventType: text("event_type").notNull(),
	endpoint: text("endpoint").notNull(),
	level: text("level").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	clientIpAddr: text("client_ip_addr").notNull(),
	targetType: text("target_id"),
	targetId: text("target_type"),
	result: text("result").notNull(),
	message: text("message"),
});

// Below code is for NextAuth

export const users = sqliteTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
	image: text("image"),
});

export const accounts = sqliteTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccountType>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const sessions = sqliteTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	}),
);

export const authenticators = sqliteTable(
	"authenticator",
	{
		credentialID: text("credentialID").notNull().unique(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		providerAccountId: text("providerAccountId").notNull(),
		credentialPublicKey: text("credentialPublicKey").notNull(),
		counter: integer("counter").notNull(),
		credentialDeviceType: text("credentialDeviceType").notNull(),
		credentialBackedUp: integer("credentialBackedUp", {
			mode: "boolean",
		}).notNull(),
		transports: text("transports"),
	},
	(authenticator) => ({
		compositePK: primaryKey({
			columns: [authenticator.userId, authenticator.credentialID],
		}),
	}),
);

export const credentialAccounts = sqliteTable("credential_account", {
	id: integer("id").primaryKey(),
	email: text("email").notNull().unique(),
	hashedPassword: text("hashed_password").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});
