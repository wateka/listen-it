"use client";

import Loading from "@/components/Loading";
import { signIn, useSession } from "next-auth/react";
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
			callbackUrl,
		});
	};

	const handleSpotifyLogin = async () => {
		await signIn("spotify", {
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
					<div>
						<a href="/" className="link text-sm text-gray-500">
							トップページへ戻る
						</a>
					</div>
				</div>
			</div>
		</>
	);
}
