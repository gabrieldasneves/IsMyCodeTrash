import Link from "next/link";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { getLeaderboard } from "@/db/queries/leaderboard";
import { getHomepageStats } from "@/db/queries/stats";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
	const [leaderboard, stats] = await Promise.all([
		getLeaderboard(50),
		getHomepageStats(),
	]);

	const totalFormatted = stats.totalRoasts.toLocaleString("en-US");
	const avgFormatted =
		stats.averageScore !== null
			? `${Number(stats.averageScore).toFixed(1)}/10`
			: "—";

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			{/* ── Navbar ──────────────────────────────────────────────────── */}
			<nav className="flex h-14 items-center justify-between border-b border-[var(--color-border-primary)] bg-[var(--color-bg-page)] px-10">
				<Link href="/" className="flex items-center gap-2">
					<span className="font-mono text-xl font-bold text-emerald-500">
						&gt;
					</span>
					<span className="font-mono text-lg font-medium text-[var(--color-text-primary)]">
						devroast
					</span>
				</Link>
				<span className="font-mono text-sm text-[var(--color-text-secondary)]">
					leaderboard
				</span>
			</nav>

			<div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
				{/* ── Hero ────────────────────────────────────────────────── */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-3xl font-bold text-emerald-500">
							&gt;
						</span>
						<h1 className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
							shame_leaderboard
						</h1>
					</div>
					<p className="font-sans text-sm text-[var(--color-text-secondary)]">
						{"// the most roasted code on the internet"}
					</p>
					<div className="flex items-center gap-2">
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							{totalFormatted} submissions
						</span>
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							·
						</span>
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							avg score: {avgFormatted}
						</span>
					</div>
				</section>

				{/* ── Table ───────────────────────────────────────────────── */}
				<div className="border border-[var(--color-border-primary)]">
					{/* Header */}
					<div className="flex h-10 items-center gap-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-5">
						<span className="w-10 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
							#
						</span>
						<span className="w-14 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
							score
						</span>
						<span className="flex-1 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
							roast
						</span>
						<span className="w-24 shrink-0 text-right font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
							lang
						</span>
					</div>

					{/* Rows */}
					{leaderboard.length === 0 ? (
						<div className="flex items-center justify-center px-5 py-16">
							<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
								{/* no roasts yet. be the first. */}
							</span>
						</div>
					) : (
						leaderboard.map((entry, i) => (
							<Link
								key={entry.id}
								href={`/roast/${entry.slug}`}
								className="block hover:bg-[var(--color-bg-surface)] transition-colors"
							>
								<LeaderboardRow
									rank={i + 1}
									score={entry.score}
									codePreview={entry.roastQuote}
									language={entry.language}
								/>
							</Link>
						))
					)}
				</div>
			</div>
		</main>
	);
}
