"use client";

import { useEffect, useMemo, useState } from "react";
import { hc } from "hono/client";
import type { AppType } from "@/app/api/[...route]/route";
import TrackView from "../send/[id]/track-view";

import dayjs from "dayjs";
import "dayjs/locale/ja";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import Loading from "@/components/Loading";

dayjs.extend(relativeTime);
dayjs.locale("ja");

const client = hc<AppType>("/");

export default function HomePage() {
	const [copied, setCopied] = useState(false);

	const [userId, setUserId] = useState<string | undefined>(undefined);
	const [tracks, setTracks] = useState<
		| {
				id: number;
				spotifyId: string;
				spotifyUrl: string;
				name: string;
				artistName: string;
				image: string | null;
				fromUserId: string;
				fromUserName: string | null | undefined;
				fromUserImage: string | null | undefined;
				addedToPlaylist: boolean;
				createdAt: string;
		  }[]
		| undefined
	>(undefined);

	const userPagePath = useMemo(
		() => `https://listen-it.wateka.dev/send/${userId}`,
		[userId],
	);

	// const handleAddTracksToPlaylist = useCallback(async () => {
	// 	const res = await client.api.me.playlist.tracks.$put();
	// 	if (res.ok) {
	// 		alert("プレイリストに追加しました！");
	// 	} else {
	// 		alert("プレイリストに追加できませんでした。");
	// 	}
	// }, []);

	useEffect(() => {
		const fetchUserData = async () => {
			const res = await client.api.me.$get();
			if (res.ok) {
				const userData = await res.json();
				setUserId(userData.id);
			} else {
				console.error("Failed to fetch user data");
			}
		};

		const fetchTracksData = async () => {
			const res = await client.api.me["received-tracks"].$get();
			if (res.ok) {
				const tracks = await res.json();
				setTracks(tracks);
			}
		};

		fetchUserData();
		fetchTracksData();
	}, []);

	if (!userId || !tracks) {
		return <Loading />;
	}

	return (
		<div>
			<div className="card border border-gray-300 shadow-sm p-4 mb-8">
				<h2 className="text-lg mb-2">友達に曲を送ってもらおう！</h2>
				<p className="text-gray-500 text-sm mb-4">
					以下のURLを友達に共有すると、そこから曲を送ってもらえます。
				</p>

				<div className="join rounded-box rounded-md">
					<input
						type="text"
						disabled
						className="join-item input w-full"
						value={userPagePath}
					/>
					<button
						type="button"
						className="join-item btn"
						onClick={async () => {
							navigator.clipboard.writeText(userPagePath);
							setCopied(true);
						}}
					>
						{copied ? (
							<span className="flex items-center gap-2 text-green-700">
								<CheckCircleIcon className="w-4 h-4" />
								コピー
							</span>
						) : (
							<span>コピー</span>
						)}
					</button>
				</div>
			</div>

			<h2 className="text-lg mb-4">あなたに届いた曲（最新10件）</h2>

			{/* <button
				type="button"
				className="block btn btn-accent my-4 rounded-full"
				onClick={handleAddTracksToPlaylist}
			>
				届いた曲をプレイリストに追加する
			</button> */}

			{tracks === undefined ? (
				<div className="flex items-center justify-center gap-4 text-sm text-gray-500">
					<div className="loading loading-dots" />
					読み込み中
				</div>
			) : (
				tracks.map((track) => (
					<div key={track.id} className="mb-8">
						<div className="flex items-center">
							<img
								src={track.fromUserImage || ""}
								alt="Sender user icon"
								className="rounded-full w-8 h-8"
							/>
							<span className="ml-2">{track.fromUserName}</span>
							<span className="ml-2 text-gray-500">さんから</span>
							<span className="text-sm text-gray-500">
								・{dayjs(track.createdAt).fromNow()}
							</span>
							<span className="ml-2 flex items-center">
								{track.addedToPlaylist ? (
									<span className="tooltip" data-tip="プレイリストに追加済み">
										<CheckCircleIcon className="w-4 h-4 text-green-600" />
									</span>
								) : (
									<span className="tooltip" data-tip="プレイリストに未追加">
										<AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
									</span>
								)}
							</span>
						</div>

						<div className="ml-4">
							<TrackView track={track} />
						</div>
					</div>
				))
			)}
		</div>
	);
}
