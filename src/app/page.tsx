import Link from "next/link";
import { RoastForm } from "@/components/roast-form";
import { Button } from "@/components/ui/button";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { getLeaderboard } from "@/db/queries/leaderboard";
import { getHomepageStats } from "@/db/queries/stats";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
	const [leaderboard, stats] = await Promise.all([
		getLeaderboard(3),
		getHomepageStats(),
	]);

	const totalFormatted = stats.totalRoasts.toLocaleString("en-US");
	const avgFormatted =
		stats.averageScore !== null
			? `${Number(stats.averageScore).toFixed(1)}/10`
			: "—";

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			<div className="mx-auto max-w-5xl px-10 py-20">
				{/* ── Hero ──────────────────────────────────────────────────── */}
				<section className="flex flex-col gap-3 mb-10">
					<div className="flex items-center gap-3">
						<span className="font-mono text-4xl font-bold text-emerald-500">
							$
						</span>
						<h1 className="font-mono text-4xl font-bold text-[var(--color-text-primary)]">
							paste your code. get roasted.
						</h1>
					</div>
					<p className="font-sans text-sm text-[var(--color-text-secondary)]">
						{
							"// drop your code below and we'll rate it — brutally honest or full roast mode"
						}
					</p>
				</section>

				{/* ── Code Input ────────────────────────────────────────────── */}
				<RoastForm />

				{/* Footer hint */}
				<div className="flex w-full max-w-[780px] items-center justify-center gap-6 pt-2">
					<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
						{totalFormatted} codes roasted
					</span>
					<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
						·
					</span>
					<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
						avg score: {avgFormatted}
					</span>
				</div>

				{/* ── Spacer ────────────────────────────────────────────────── */}
				<div className="h-16" />

				{/* ── Shame Leaderboard Preview ─────────────────────────────── */}
				<section className="flex flex-col gap-6">
					{/* Section header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm font-bold text-emerald-500">
								{"//"}
							</span>
							<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
								shame_leaderboard
							</span>
						</div>
						<Link href="/leaderboard">
							<Button variant="outline" size="sm">
								$ view_all {">>"}
							</Button>
						</Link>
					</div>

					<p className="font-sans text-sm text-[var(--color-text-tertiary)]">
						{"// the worst code on the internet, ranked by shame"}
					</p>

					{/* Table */}
					<div className="border border-[var(--color-border-primary)]">
						{/* Table header */}
						<div className="flex h-10 items-center gap-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-5">
							<span className="w-10 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
								#
							</span>
							<span className="w-14 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
								score
							</span>
							<span className="flex-1 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
								code
							</span>
							<span className="w-24 shrink-0 text-right font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
								lang
							</span>
						</div>

						{/* Rows */}
						{leaderboard.length === 0 ? (
							<div className="flex items-center justify-center px-5 py-10">
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

					{/* Footer hint */}
					<div className="flex items-center justify-center py-1">
						<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
							showing top {leaderboard.length} of {totalFormatted} ·{" "}
							<Link
								href="/leaderboard"
								className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
							>
								view full leaderboard {">>"}
							</Link>
						</span>
					</div>
				</section>
			</div>
		</main>
	);
}
