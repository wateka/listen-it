import Image from "next/image";
import type { TrackItems } from "@/app/api/[...route]/route";

export default function TrackView(props: { track: TrackItems[0] }) {
	const track = props.track;

	return (
		<a
			href={track?.spotifyUrl || ""}
			target="new"
			className="flex items-center border-2 border-gray-200 rounded-lg gap-4 my-2 p-4 hover:bg-gray-50 active:bg-gray-100 transition ease-in"
		>
			<img
				src={track?.image || ""}
				alt="アルバムアート"
				className="block w-12 h-12 rounded-[2px]"
			/>
			<div className="flex-1">
				{track?.name || ""}
				<div className="text-sm text-gray-500">{track?.artistName}</div>
			</div>
			<Image
				src="/images/spotify_icon.png"
				alt="Spotify"
				width={24}
				height={24}
				className="block w-6 h-6"
			/>
		</a>
	);
}
