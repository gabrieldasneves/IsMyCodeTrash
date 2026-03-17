import { cacheLife } from "next/cache";
import Link from "next/link";
import type { BundledLanguage } from "shiki";
import { LeaderboardEntry } from "@/components/ui/leaderboard-entry";
import { caller } from "@/trpc/server";

// Server Component assíncrono — usa caller direto para dados que não precisam
// ser hidratados no cliente. Permite usar o LeaderboardEntry (Shiki async Server Component).
export async function LeaderboardPageContent() {
	"use cache";
	cacheLife("hours");

	const { entries, totalRoasts, averageScore } =
		await caller.leaderboard.page();

	const totalFormatted = totalRoasts.toLocaleString("en-US");
	const avgFormatted =
		averageScore !== null ? `${Number(averageScore).toFixed(1)}/10` : "—";

	return (
		<>
			{/* ── Stats row ──────────────────────────────────────────────── */}
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

			{/* ── Entries ─────────────────────────────────────────────────── */}
			<section className="flex flex-col gap-5">
				{entries.length === 0 ? (
					<div className="flex items-center justify-center py-20">
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							{"// no roasts yet. be the first."}
						</span>
					</div>
				) : (
					entries.map((entry, i) => (
						<Link
							key={entry.id}
							href={`/roast/${entry.id}`}
							className="block transition-opacity not-disabled:hover:opacity-90"
						>
							<LeaderboardEntry
								rank={i + 1}
								score={entry.score}
								language={entry.language}
								code={entry.code}
								lang={entry.language as BundledLanguage}
							/>
						</Link>
					))
				)}
			</section>

			{/* ── Footer ─────────────────────────────────────────────────── */}
			<div className="flex items-center justify-center py-4">
				<Link
					href="/"
					className="font-mono text-xs text-[var(--color-text-tertiary)] transition-colors not-disabled:hover:text-[var(--color-text-secondary)]"
				>
					{"< back to roaster"}
				</Link>
			</div>
		</>
	);
}
