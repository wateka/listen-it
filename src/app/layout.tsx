import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Listen it, ____!",
	description: "友達に聴いてほしい曲を、送ろう。送ってもらおう。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<html lang="ja">
				<body className={inter.className}>{children}</body>
			</html>
		</SessionProvider>
	);
}

// function Providers();
