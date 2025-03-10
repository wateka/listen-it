"use client";

import { hc } from "hono/client";
import type { AppType, TrackItems } from "@/app/api/[...route]/route";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Header from "../header";
import { HomeIcon, HouseIcon, SendIcon } from "lucide-react";
import TrackView from "../track-view";
import { LoggedInStatusCard } from "../login-status-card";
import { useSession } from "next-auth/react";

const client = hc<AppType>("/");

export default function Page({ params }: { params: { id: string } }) {
	const { data: session, status } = useSession();
	const fromUser = session?.user;

	const toUserId = params.id;
	const [toUser, setToUser] = useState<
		| {
				id: string;
				name: string | null;
				image: string | null;
		  }
		| undefined
	>(undefined);

	const [track, setTrack] = useState<TrackItems[0] | undefined>(undefined);

	useEffect(() => {
		const fetchUserData = async () => {
			const res = await client.api.users[":id"].$get({
				param: { id: toUserId },
			});
			if (res.ok) {
				const user = await res.json();
				setToUser(user);
			} else {
				console.error("Failed to fetch user data");
			}
		};

		const fetchLatestTrack = async () => {
			const res = await client.api.me["last-sent-track"].$get({
				query: {
					toUserId: toUserId,
				},
			});
			if (res.ok) {
				const track = await res.json();
				setTrack(track);
			}
		};

		fetchUserData();
		fetchLatestTrack();
	}, [toUserId]);

	if (status === "loading") {
		return <Loading />;
	}

	if (status === "unauthenticated" || fromUser === undefined) {
		return "Sender user not found.";
	}

	if (track === undefined) {
		return "Track not found.";
	}

	if (toUser === undefined) {
		return "Receiver user not found.";
	}

	return (
		<>
			<div className="w-full max-w-screen-sm px-6 mx-auto">
				<Header toUser={toUser} />

				<LoggedInStatusCard fromUser={fromUser} />

				<h2 className="text-xl mt-12">曲が送信されました！</h2>
				<TrackView track={track} />

				<div className="flex gap-4 items-center justify-center mt-12">
					<a href={`/send/${toUserId}`} className="btn rounded-full">
						<SendIcon />
						他の曲も送る
					</a>
					<a href="/home" className="btn rounded-full">
						<HomeIcon />
						ホームへ
					</a>
				</div>
			</div>
		</>
	);
}
