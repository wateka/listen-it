import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Listen it",
	description: "友達のプレイリストに、聴かせたい曲を送ろう！",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<html lang="ja" className={inter.className}>
				<body>{children}</body>
			</html>
		</SessionProvider>
	);
}
