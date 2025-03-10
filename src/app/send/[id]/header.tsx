export default function Header(props: {
	toUser: {
		id: string;
		name: string | null;
		image: string | null;
	};
}) {
	const toUser = props.toUser;

	return (
		<header className="mt-12 mb-6">
			<h1 className="text-4xl flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-4">
				<span>Listen it, </span>
				<span className="flex items-center">
					<img
						src={toUser.image || ""}
						alt={`${toUser.name} のアイコン`}
						className="rounded-full w-16 h-16 mr-2"
					/>
					{toUser.name}!
				</span>
			</h1>
			<div className="flex flex-wrap justify-center items-center gap-0">
				<span>{toUser.name} さんの</span>
				<span>Spotifyプレイリストに</span>
				<span>曲を送ろう！</span>
			</div>
		</header>
	);
}
