"use client";

import { useState, useEffect } from "react";
import { hc } from "hono/client";
import type { AppType } from "@/app/api/[...route]/route";
import useToast from "./use-toast";

const client = hc<AppType>("/");

const SettingsPage = () => {
	const [username, setUsername] = useState("");
	const [usernameChanged, setUsernameChanged] = useState(false);
	const { toasts, addToast } = useToast();

	useEffect(() => {
		const fetchUserData = async () => {
			const res = await client.api.me.$get();
			if (res.ok) {
				const userData = await res.json();
				setUsername(userData.name || "");
			} else {
				console.error("Failed to fetch user data");
			}
		};

		fetchUserData();
	}, []);

	const handleUsernameSubmit = async () => {
		const res = await client.api.me.username.$put({
			json: { username },
		});
		if (res.ok) {
			addToast("Username updated successfully!", "success");
			setUsernameChanged(false);
		} else {
			addToast("Failed to update username.", "error");
		}
	};

	return (
		<>
			<div className="container mx-auto">
				<h1 className="text-2xl font-bold mb-4">ユーザ設定</h1>
				<label htmlFor="username" className="block mt-4 mb-2 text-lg">
					ユーザー名
				</label>
				<div className="flex flex-wrap gap-2">
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => {
							setUsername(e.target.value);
							setUsernameChanged(true);
						}}
						className="input border-solid"
					/>
					<button
						type="button"
						className="btn"
						onClick={handleUsernameSubmit}
						disabled={!usernameChanged}
					>
						更新
					</button>
				</div>
				{/* <label htmlFor="create-playlist" className="block mt-8 mb-2 text-lg">
					Spotify連携
				</label>
				<div>
					<button type="button" className="btn" onClick={handleSpotifyAuth}>
						連携する
					</button>
				</div> */}
			</div>
			<div className="toast toast-top toast-center">
				{toasts.map(({ id, type, message }) => (
					<div key={id} className={`alert alert-${type}`}>
						{message}
					</div>
				))}
			</div>
		</>
	);
};

export default SettingsPage;
