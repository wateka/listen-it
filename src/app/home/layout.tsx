import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth"
import MenuDropdown from "./MenuDropdown";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	const userImageUrl = session.user?.image || "/avatar.png";
	const userName = session.user?.name ?? "";

	return (
		<>
			<header className="navbar border-2 border-b border-gray-200">
				<div className="w-full max-w-screen-sm flex justify-between items-center mx-auto">
					<h1 className="flex-1">
						<Link href="/home" className="btn btn-ghost btn-lg">
							Listen it, ____!
						</Link>
					</h1>

					<MenuDropdown userImageUrl={userImageUrl} userName={userName} />
				</div>
			</header>
			<main className="w-full max-w-screen-sm mx-auto p-4">{children}</main>
		</>
	);
}
