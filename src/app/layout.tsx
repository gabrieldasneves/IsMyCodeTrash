import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/ui/navbar";
import { ThemeProvider } from "@/context/theme";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "CodeRoaster",
	description: "CodeRoaster",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className={jetBrainsMono.variable}>
			<body>
				<ThemeProvider>
					<Navbar />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
