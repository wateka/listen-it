"use client";

import { useEffect, useMemo, useState } from "react";
import { hc } from "hono/client";
import type { AppType } from "@/app/api/[...route]/route";
import Loading from "@/components/Loading";
import ShareCard from "./ShareCard";
import ReceivedTracksList, { ReceivedTrack } from "./ReceivedTracksList";
import SentTracksList, { SentTrack } from "./SentTracksList";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RecentSentUsers, { RecentSentUser } from "./RecentSentUsers";

const client = hc<AppType>("/");

export default function HomePage() {
	const [userId, setUserId] = useState<string | undefined>(undefined);
	const [receivedTracks, setReceivedTracks] = useState<ReceivedTrack[]>([]);
	const [sentTracks, setSentTracks] = useState<SentTrack[]>([]);
	const [recentSentUsers, setRecentSentUsers] = useState<RecentSentUser[] | undefined>(undefined);

	const [receivedOffset, setReceivedOffset] = useState(0);
	const [receivedLoading, setReceivedLoading] = useState(false);
	const [receivedHasMore, setReceivedHasMore] = useState(true);

	const [sentOffset, setSentOffset] = useState(0);
	const [sentLoading, setSentLoading] = useState(false);
	const [sentHasMore, setSentHasMore] = useState(true);

	const searchParams = useSearchParams();
	const router = useRouter();
	const tab = searchParams.get("tab") ?? "received";

	const userPagePath = useMemo(
		() => `https://listen-it.wateka.dev/send/${userId}`,
		[userId],
	);

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

		const fetchReceived = async () => {
			setReceivedLoading(true);
			const res = await client.api.me["received-tracks"].$get({ query: { limit: 10, offset: 0 } });
			if (res.ok) {
				const tracks = await res.json();
				setReceivedTracks(tracks);
				setReceivedOffset(tracks.length);
				setReceivedHasMore(tracks.length === 10);
			}
			setReceivedLoading(false);
		};

		const fetchSent = async () => {
			setSentLoading(true);
			const res = await client.api.me["sent-tracks"].$get({ query: { limit: 10, offset: 0 } });
			if (res.ok) {
				const tracks = await res.json();
				setSentTracks(tracks);
				setSentOffset(tracks.length);
				setSentHasMore(tracks.length === 10);
			}
			setSentLoading(false);
		};

		const fetchRecentSentUsers = async () => {
			const res = await client.api.me["recent-sent-users"].$get();
			if (res.ok) {
				const users = await res.json();
				setRecentSentUsers(users);
			}
		};

		fetchUserData();
		fetchReceived();
		fetchSent();
		fetchRecentSentUsers();
	}, []);

	// もっと表示: 受信
	const handleLoadMoreReceived = async () => {
		setReceivedLoading(true);
		const res = await client.api.me["received-tracks"].$get({ query: { limit: 10, offset: receivedOffset } });
		if (res.ok) {
			const tracks = await res.json();
			setReceivedTracks((prev) => [...prev, ...tracks]);
			setReceivedOffset((prev) => prev + tracks.length);
			setReceivedHasMore(tracks.length === 10);
		}
		setReceivedLoading(false);
	};

	// もっと表示: 送信
	const handleLoadMoreSent = async () => {
		setSentLoading(true);
		const res = await client.api.me["sent-tracks"].$get({ query: { limit: 10, offset: sentOffset } });
		if (res.ok) {
			const tracks = await res.json();
			setSentTracks((prev) => [...prev, ...tracks]);
			setSentOffset((prev) => prev + tracks.length);
			setSentHasMore(tracks.length === 10);
		}
		setSentLoading(false);
	};

	const handleTabChange = (nextTab: "received" | "sent") => {
		router.push(`?tab=${nextTab}`);
	};

	if (!userId || receivedTracks === undefined || sentTracks === undefined) {
		return <Loading />;
	}

	return (
		<div>
			<div className="tabs tabs-border">
				<input
					type="radio"
					name="home_tabs"
					className="tab"
					aria-label="受け取る"
					checked={tab === "received"}
					onChange={() => handleTabChange("received")}
				/>
				<div className="tab-content mt-4">
					<ShareCard userPagePath={userPagePath} />

					<h2 className="text-lg mb-4">あなたに届いた曲</h2>
					<ReceivedTracksList
						tracks={receivedTracks}
						onLoadMore={handleLoadMoreReceived}
						loading={receivedLoading}
						hasMore={receivedHasMore}
					/>
				</div>

				<input
					type="radio"
					name="home_tabs"
					className="tab"
					aria-label="送る"
					checked={tab === "sent"}
					onChange={() => handleTabChange("sent")}
				/>
				<div className="tab-content mt-4">
					<h2 className="text-lg mb-1">最近曲を送った友達</h2>
					<p className="text-sm text-gray-500 mb-2">クリックすると、もう一度曲を送れます！</p>
					{recentSentUsers ? <RecentSentUsers users={recentSentUsers} /> : <div className="mb-6">Loading...</div>}
					<h2 className="text-lg mb-4">あなたが送った曲</h2>
					<SentTracksList
						tracks={sentTracks}
						onLoadMore={handleLoadMoreSent}
						loading={sentLoading}
						hasMore={sentHasMore}
					/>
				</div>
			</div>
		</div>
	);
}
