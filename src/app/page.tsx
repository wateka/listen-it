export default function Home() {
	return (
		<div
			className="hero min-h-screen"
			style={{
				backgroundImage: "url(/images/cover_unsplash_icon8-team.jpg)",
			}}
		>
			<div className="hero-overlay" />
			<div className="hero-content text-neutral-content text-center">
				<div className="max-w-lg">
					<h1 className="mb-6 text-5xl">Listen it, ____!</h1>
					<div className="mb-6">
						<p className="mb-2">
							友達の聴いてほしい曲を、あなたのプレイリストに送ってもらおう！
						</p>
						<p className="mb-2">
							送り先のリンクを友達と共有すると、友達は Listen it!
							上で曲を検索して、あなたに送ることができます。
						</p>
						<p className="mb-2">
							友達に送ってもらった曲は、ボタン一つであなたの Spotify
							プレイリストに追加することができます。
						</p>
					</div>
					<a href="/login" className="btn btn-lg btn-accent rounded-full">
						使ってみる
					</a>
				</div>
			</div>
		</div>
	);
}
