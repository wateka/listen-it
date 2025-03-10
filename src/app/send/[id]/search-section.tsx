import { useState } from "react";
import { hc } from "hono/client";
import type { AppType, TrackItems } from "@/app/api/[...route]/route";
import Image from "next/image";
import { SearchIcon, SendIcon } from "lucide-react";

const client = hc<AppType>("/");

export default function SearchSection(props: {
	onSelect: (track: TrackItems[0]) => void;
	disabled?: boolean;
}) {
	const [searchText, setSearchText] = useState("");
	const [tracks, setTracks] = useState<TrackItems | undefined>(undefined);
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = async () => {
		setIsSearching(true);
		const res = await client.api.search.$get({
			query: { q: searchText },
		});
		if (res.ok) {
			const tracks = await res.json();
			setTracks(tracks);
		}
		setIsSearching(false);
	};

	return (
		<section className="mt-12 mb-8">
			<div className="flex flex-col items-center my-4">
				<div className="join w-full max-w-md mx-auto mb-2">
					<input
						type="text"
						placeholder="送りたい曲を検索しよう！"
						className="join-item input input-lg input-accent grow border-solid rounded-l-full shadow-lg"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						disabled={props.disabled}
					/>
					<button
						type="button"
						onClick={handleSearch}
						className="join-item btn btn-lg btn-accent shadow-lg rounded-r-full"
						disabled={props.disabled}
					>
						<SearchIcon className="w-5 h-5" />
						検索
					</button>
				</div>
			</div>

			<ul className="list rounded-box border border-gray-300 px-2 pb-4 overflow-scroll">
				<li className="sticky top-0 z-10 flex items-center justify-between bg-white">
					<div className="m-4">Spotify の検索結果</div>
					<div className="h-6 m-4">
						<a href="https://open.spotify.com/">
							<Image
								src="/images/spotify_logo.png"
								alt="Spotify"
								width={88}
								height={24}
							/>
						</a>
					</div>
				</li>

				{isSearching ? (
					<li className="flex justify-center items-center gap-4 p-4 text-gray-500">
						<span className="loading loading-dots loading-md" />
						<span>検索中</span>
					</li>
				) : tracks === undefined ? (
					<li className="flex justify-center items-center  p-4 text-gray-500">
						曲名・アーティスト名・キーワードなどで検索できます。
					</li>
				) : tracks.length === 0 ? (
					<li className="flex justify-center items-center  p-4 text-gray-500">
						検索結果はありません
					</li>
				) : (
					tracks.map((track) => (
						<li
							className="list-row items-center rounded-none border-t border-solid border-gray-200"
							key={track.spotifyId}
						>
							<img
								src={track.image || ""}
								alt="Album art"
								className="block w-12 h-12 rounded-[2px]"
							/>
							<div>
								<div>
									<a
										href={track.spotifyUrl}
										target="new"
										className="link link-hover"
									>
										{track.name}
									</a>
								</div>
								<div className="text-sm text-gray-500">{track.artistName}</div>
							</div>
							{/* <div>
								<a href={track.spotifyUrl} className="btn btn-ghost">
									<span className="m-[9px] ml-0">
										<Image
											src="/images/spotify_icon.png"
											alt="Spotifyで再生"
											width={21}
											height={21}
										/>
									</span>
									<span>再生</span>
								</a>
							</div> */}
							<div>
								<button
									type="button"
									onClick={() => props.onSelect(track)}
									className="btn"
								>
									<SendIcon className="w-4 h-4" />
									送る
								</button>
							</div>
						</li>
					))
				)}
			</ul>
		</section>
	);
}
