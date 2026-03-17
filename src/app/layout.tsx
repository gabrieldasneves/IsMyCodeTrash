import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Navbar } from "@/components/ui/navbar";
import { ThemeProvider } from "@/context/theme";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "IsMyCodeTrash",
	description: "IsMyCodeTrash",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
	),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className={jetBrainsMono.variable}>
			<body>
				<TRPCReactProvider>
					<Suspense>
						<ThemeProvider>
							<Navbar />
							{children}
						</ThemeProvider>
					</Suspense>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
