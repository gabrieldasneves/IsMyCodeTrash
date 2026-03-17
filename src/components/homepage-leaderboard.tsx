import { cacheLife } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { caller } from "@/trpc/server";

export async function HomepageLeaderboard() {
	"use cache";
	cacheLife("hours");

	const { entries, totalRoasts } = await caller.leaderboard.preview();

	const totalFormatted = totalRoasts.toLocaleString("en-US");

	return (
		<section className="flex flex-col gap-6">
			{/* ── Section header ─────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
						shame leaderboard
					</span>
				</div>
				<Link href="/leaderboard">
					<Button variant="outline" size="sm">
						view all {">>"}
					</Button>
				</Link>
			</div>

			{/* ── Subtitle ────────────────────────────────────────────────── */}
			<p className="font-sans text-sm text-[var(--color-text-tertiary)]">
				{"the worst code on the internet, ranked by shame"}
			</p>

			{/* ── Table ───────────────────────────────────────────────────── */}
			<div className="border border-[var(--color-border-primary)]">
				{/* Table header */}
				<div className="flex h-10 items-center gap-4 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-5">
					<span className="font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
						#
					</span>
					<span className="font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
						score
					</span>
					<span className="flex-1 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
						code
					</span>
					<span className="font-mono text-xs font-medium text-[var(--color-text-tertiary)]">
						lang
					</span>
				</div>

				{/* Rows */}
				{entries.length === 0 ? (
					<div className="flex items-center justify-center px-5 py-10">
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							{"// no roasts yet. be the first."}
						</span>
					</div>
				) : (
					entries.map((entry, i) => (
						<Link
							key={entry.id}
							href={`/roast/${entry.id}`}
							className="block transition-colors not-disabled:hover:bg-[var(--color-bg-surface)]"
						>
							<LeaderboardRow
								rank={i + 1}
								score={entry.score}
								code={entry.code}
								language={entry.language}
							/>
						</Link>
					))
				)}
			</div>

			{/* ── Footer de métricas ──────────────────────────────────────── */}
			<div className="flex items-center justify-center py-1">
				<span className="font-sans text-xs text-[var(--color-text-tertiary)]">
					showing top {entries.length} of {totalFormatted} ·{" "}
					<Link
						href="/leaderboard"
						className="text-[var(--color-text-secondary)] transition-colors not-disabled:hover:text-[var(--color-text-primary)]"
					>
						view full leaderboard {">>"}
					</Link>
				</span>
			</div>
		</section>
	);
}
