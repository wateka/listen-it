import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
	title: "Listen it, ____!",
	description: "友達のプレイリストに、聴かせたい曲を送りつけよう！",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<html lang="en">
				<body>{children}</body>
			</html>
		</SessionProvider>
	);
}
