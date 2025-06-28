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
	const [receivedTracks, setReceivedTracks] = useState<ReceivedTrack[] | undefined>(undefined);
	const [sentTracks, setSentTracks] = useState<SentTrack[] | undefined>(undefined);
	const [recentSentUsers, setRecentSentUsers] = useState<RecentSentUser[] | undefined>(undefined);

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

		const fetchTracksData = async () => {
			const res = await client.api.me["received-tracks"].$get();
			if (res.ok) {
				const tracks = await res.json();
				setReceivedTracks(tracks);
			}
		};

		const fetchSentTracksData = async () => {
			const res = await client.api.me["sent-tracks"].$get();
			if (res.ok) {
				const sentTracks = await res.json();
				setSentTracks(sentTracks);
			}
		};

		const fetchRecentSentUsers = async () => {
			const res = await client.api.me["recent-sent-users"].$get();
			if (res.ok) {
				const users = await res.json();
				setRecentSentUsers(users);
			}
		};

		fetchUserData();
		fetchTracksData();
		fetchSentTracksData();
		fetchRecentSentUsers();
	}, []);

	const handleTabChange = (nextTab: "received" | "sent") => {
		router.push(`?tab=${nextTab}`);
	};

	if (!userId || !receivedTracks || !sentTracks) {
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

					<h2 className="text-lg mb-4">あなたに届いた曲（最新20件）</h2>
					<ReceivedTracksList tracks={receivedTracks} />
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
					{/* <div className="card border border-gray-300 shadow-sm p-4 mb-8"> */}
						<h2 className="text-lg mb-1">最近曲を送った友達</h2>
						<p className="text-sm text-gray-500 mb-2">クリックすると、もう一度曲を送れます！</p>
						{recentSentUsers ? <RecentSentUsers users={recentSentUsers} /> : <div className="mb-6">Loading...</div>}
					{/* </div> */}
					
					<h2 className="text-lg mb-4">あなたが送った曲（最新20件）</h2>
					<SentTracksList tracks={sentTracks} />
				</div>
			</div>
		</div>
	);
}
