import { usePathname } from "next/navigation";

export function LoggedInStatusCard(props: {
	fromUser: {
		name?: string | null;
		image?: string | null;
	};
}) {
	const pathname = usePathname();
	const fromUser = props.fromUser;

	return (
		<div className="flex">
			<div className="flex items-center text-sm bg-gray-50 mx-auto p-1 rounded-full">
				<img
					src={fromUser.image || ""}
					alt="your icon"
					className="w-6 h-6 rounded-full mr-2"
				/>
				<span className="flex items-center mr-2">{fromUser.name}</span>
				<span className="text-gray-500 text-xs">としてログイン中</span>
				<a
					href={`/login?callback=${pathname}`}
					className="btn btn-xs ml-4 rounded-full"
				>
					再ログイン
				</a>
			</div>
		</div>
	);
}

export function NotLoggedInStatusCard() {
	const pathname = usePathname();

	return (
		<div className="card border bg-gray-50 my-8 p-4">
			<h2 className="text-lg mb-4">Listen it! とは？</h2>
			<div className="text-gray-500 text-sm mb-2">
				<p className="mb-2">
					あなたが聴いてほしい曲を、相手のSpotifyのプレイリストに送れるアプリです。
				</p>
				<p className="mb-2">
					このページから曲を検索して送ると、相手のプレイリストに自動で追加されます。
				</p>
				<p className="mb-2">
					Spotifyアカウントを持っていなくても、相手に簡単に音楽をシェアできます！
				</p>
			</div>
			<a
				href={`/login?callback=${pathname}`}
				className="btn btn-accent mx-auto rounded-full"
			>
				Spotify または Google アカウントでログイン
			</a>
		</div>
	);
}
