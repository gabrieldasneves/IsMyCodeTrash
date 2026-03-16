"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";

export function HomepageLeaderboard() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.leaderboard.preview.queryOptions());

	const { entries, totalRoasts } = data;
	const totalFormatted = totalRoasts.toLocaleString("en-US");

	return (
		<section className="flex flex-col gap-6">
			{/* ── Section header ─────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-bold text-emerald-500">{"//"}</span>
					<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
						shame_leaderboard
					</span>
				</div>
				<Link href="/leaderboard">
					<Button variant="outline" size="sm">$ view_all {">>"}</Button>
				</Link>
			</div>

			{/* ── Subtitle ────────────────────────────────────────────────── */}
			<p className="font-sans text-sm text-[var(--color-text-tertiary)]">
				{"// the worst code on the internet, ranked by shame"}
			</p>

			{/* ── Table ───────────────────────────────────────────────────── */}
			<div className="border border-[var(--color-border-primary)]">
				{/* Table header */}
				<div className="flex h-10 items-center gap-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-5">
					<span className="w-10 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">#</span>
					<span className="w-14 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">score</span>
					<span className="flex-1 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">code</span>
					<span className="w-24 shrink-0 text-right font-mono text-xs font-medium text-[var(--color-text-tertiary)]">lang</span>
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
								codePreview={entry.roastQuote}
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
