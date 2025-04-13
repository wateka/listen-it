"use client";

import Loading from "@/components/Loading";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function LogInPage() {
	return (
		<Suspense>
			<LogIn />
		</Suspense>
	);
}

function LogIn() {
	const params = useSearchParams();
	const callbackUrl = params.get("callback") || "/home";

	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.push(callbackUrl);
		}
	}, [status, callbackUrl, router]);

	const handleGoogleLogin = async () => {
		await signIn("google", {
			callbackUrl: `/api/init?callback=${callbackUrl}`,
		});
	};

	const handleSpotifyLogin = async () => {
		await signIn("spotify", {
			callbackUrl: `/api/init?callback=${callbackUrl}`,
		});
	};

	const handleAuth0Login = async () => {
		await signIn("auth0", {
			callbackUrl: `/api/init?callback=${callbackUrl}`,
		});
	};

	if (status !== "unauthenticated") {
		return <Loading />;
	}

	return (
		<>
			<div className="grid items-center min-h-screen max-w-sm mx-auto">
				<div className="flex flex-col items-center">
					<h1 className="text-4xl mb-16">Listen it, ____!</h1>
					<h2 className="text-xl mb-8">ログイン</h2>
					<div className="grid w-full place-items-center gap-4 mb-8">
						<button
							type="button"
							onClick={handleSpotifyLogin}
							className="btn btn-wide"
						>
							Spotify でログイン
						</button>
						<button
							type="button"
							onClick={handleGoogleLogin}
							className="btn btn-wide"
						>
							Google でログイン
						</button>
					</div>
					<div className="flex flex-col items-center">
						<Link href="/" className="link text-sm text-gray-500">
							トップページへ戻る
						</Link>
						<button
							type="button"
							onClick={handleAuth0Login}
							className="btn btn-link text-gray-500 font-normal"
						>
							開発者用ログイン
						</button>
					</div>
					<div className="mt-8 text-sm text-gray-500 flex flex-col gap-2">
						<p>
							Spotify API の審査前のため、 Spotify ログインでは
							<strong>正しくログインされなかったり</strong>、
							<strong>プレイリストの作成/追加がうまく動かない</strong>
							可能性があります。
						</p>
						<p>
							その場合は、Spotify API のアクセス可能リストに追加しますので、
							<a
								href="https://bsky.app/profile/wateka.bsky.social"
								className="link"
							>
								Bluesky
							</a>
							や
							<a href="https://mixi.social/@wateka" className="link">
								mixi2
							</a>
							など、なんらかの方法で wateka (開発者) にご連絡ください。
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
