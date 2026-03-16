import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
	return (
		<header className="w-full border-b border-[var(--color-border-primary)] bg-[var(--color-bg-page)]">
			<nav className="flex h-14 items-center justify-between px-10">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 no-underline">
					<span className="font-mono text-xl font-bold text-[#7c3aed]">
						{">"}
					</span>
					<span className="font-mono text-lg font-medium text-[var(--color-text-primary)]">
						devroast
					</span>
				</Link>

				{/* Right side: links + theme toggle */}
				<div className="flex items-center gap-6">
					<Link
						href="/leaderboard"
						className="font-mono text-[13px] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
					>
						leaderboard
					</Link>
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
