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
					<div className="mb-8">
						<p className="flex flex-wrap justify-center text-xl">
							<span>友達に聴いてほしい曲を、</span>
							<span>送ろう。送ってもらおう。</span>
						</p>
					</div>
					<div className="mb-6">
						<p className="flex flex-wrap justify-center mb-4">
							<span>友達からおすすめされた曲、</span>
							<span>あとで聴こうと思ったけれど、</span>
							<span>そのまま忘れてしまう……。</span>
						</p>
						<p className="flex flex-wrap justify-center mb-4">
							<span>このサイトを使えば、</span>
							<span>友達のおすすめ曲がそのまま、</span>
							<span>あなたのSpotify プレイリストに入ります！</span>
						</p>
						<p className="flex flex-wrap justify-center mb-12">
							<span>送り先のリンクを友達と共有しておけば、</span>
							<span>Spotify をやっていない友達でも、</span>
							<span>いつでも、このサイトで曲を検索して、</span>
							<span>あなたに送ることができます。</span>
						</p>
					</div>
					<div className="flex flex-wrap justify-center gap-4">
						<a href="/login" className="btn btn-lg btn-accent rounded-full">
							ログイン
						</a>
						<a
							href="/send/3d4deeaf-6502-46e7-be0a-becd20abf100" //wateka(demo)'s page
							className="btn btn-lg rounded-full"
						>
							試しに送ってみる
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
