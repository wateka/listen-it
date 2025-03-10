"use client";

import Loading from "@/components/Loading";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <Loading />;
	}

	if (status === "unauthenticated") {
		router.push("/");
		return null;
	}

	const userImageUrl = session?.user?.image || "/avatar.png";
	const userName = session?.user?.name;

	return (
		<>
			<header className="navbar border-b border-2 border-gray-200">
				<div className="w-full max-w-screen-sm flex justify-between items-center mx-auto">
					<h1 className="flex-1">
						<a href="/home" className="btn btn-ghost btn-lg">
							Listen it, ____!
						</a>
					</h1>

					<details className="dropdown">
						<summary className="btn btn-ghost flex items-center gap-2">
							<div className="avatar">
								<div className="w-8 h-8 rounded-full">
									<img src={userImageUrl} alt="User Avatar" />
								</div>
							</div>
							<div>{userName}</div>
						</summary>

						<ul className="menu dropdown-content rounded-box bg-white border border-gray-200 z-1 w-52 mt-2 p-2 shadow-sm">
							<li>
								<a href="/home">ホーム</a>
							</li>
							<li>
								<a href="/home/history">送った曲の履歴</a>
							</li>
							<li>
								<a href="/home/settings">ユーザ設定</a>
							</li>
							<li>
								<button
									type="button"
									onClick={() => signOut()}
									className="w-full text-red-700"
								>
									サインアウトする
								</button>
							</li>
						</ul>
					</details>
				</div>
			</header>
			<main className="w-full max-w-screen-sm mx-auto p-4">{children}</main>
		</>
	);
}
