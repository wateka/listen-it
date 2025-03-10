"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { hc } from "hono/client";
import type { AppType, TrackItems } from "@/app/api/[...route]/route";
import Loading from "@/components/Loading";
import { HouseIcon, SendIcon } from "lucide-react";
import Header from "./header";
import { LoggedInStatusCard, NotLoggedInStatusCard } from "./login-status-card";
import SearchSection from "./search-section";
import Head from "next/head";
import { useRouter } from "next/navigation";
import TrackView from "./track-view";

const client = hc<AppType>("/");

export default function UserPage({ params }: { params: { id: string } }) {
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

	const modalRef = useRef<HTMLDialogElement | null>(null);
	const [track, setTrack] = useState<TrackItems[0] | undefined>(undefined);

	const handleSelectTrack = (track: TrackItems[0]) => {
		setTrack(track);
		modalRef.current?.showModal();
	};

	const [isSending, setIsSending] = useState(false);
	const router = useRouter();
	const handleSendTrack = async () => {
		setIsSending(true);
		if (toUser !== undefined && track !== undefined) {
			await client.api.users[":id"].tracks.$post({
				param: { id: toUser?.id },
				form: {
					spotifyId: track.spotifyId,
					spotifyUrl: track.spotifyUrl,
					name: track.name,
					artistName: track.artistName,
					image: track.image,
				},
			} as any);
			router.push(`/send/${toUserId}/complete`);
		}
	};

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

		fetchUserData();
	}, [toUserId]);

	if (status === "loading" || toUser === undefined) {
		return <Loading />;
	}

	return (
		<>
			<Head>
				<title>
					Listen it, {toUser.name}! | {toUser.name} さんに曲を送る
				</title>
			</Head>

			<div className="w-full max-w-screen-sm px-6 mx-auto">
				<Header toUser={toUser} />

				{status === "authenticated" ? (
					<LoggedInStatusCard fromUser={fromUser!} />
				) : (
					<NotLoggedInStatusCard />
				)}

				<SearchSection
					disabled={status === "unauthenticated"}
					onSelect={handleSelectTrack}
				/>
			</div>
			<a
				href="/home"
				className="fixed z-1000 bottom-4 left-4 btn btn-xl btn-circle shadow-xl"
			>
				<HouseIcon />
			</a>

			<dialog className="modal rounded-lg" ref={modalRef}>
				<div className="modal-backdrop backdrop-blur-lg" />
				<div className="modal-box">
					<div className="flex items-center">
						<img
							src={toUser.image || ""}
							alt={`${toUser.name} のアイコン`}
							className="rounded-full w-8 h-8 mr-2"
						/>
						{toUser.name} さんに、
					</div>
					{track ? <TrackView track={track} /> : ""}
					<div className="ml-2">を送りますか？</div>
					<div className="modal-action">
						<form method="dialog">
							<button type="submit" className="btn" disabled={isSending}>
								やっぱりやめる
							</button>
						</form>
						<button
							type="button"
							className="btn btn-accent flex gap-2"
							onClick={handleSendTrack}
							disabled={isSending}
						>
							{isSending ? (
								<>
									<div className="loading loading-dots" />
									送信中
								</>
							) : (
								<>
									<SendIcon className="w-4 h-4" />
									送る！
								</>
							)}
						</button>
					</div>
				</div>
			</dialog>
		</>
	);
}
