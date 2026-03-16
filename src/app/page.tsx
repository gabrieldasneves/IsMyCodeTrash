import { Suspense } from "react";
import { RoastForm } from "@/components/roast-form";
import { HomepageLeaderboard } from "@/components/homepage-leaderboard";
import { HomepageStats } from "@/components/homepage-stats";
import { LeaderboardPreviewSkeleton } from "@/components/ui/leaderboard-preview-skeleton";
import { StatsBarSkeleton } from "@/components/ui/stats-bar-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

// Revalida a página a cada hora — evita bater no banco a cada request
export const revalidate = 3600;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
	// Dispara ambos os prefetches em paralelo no servidor antes de renderizar
	prefetch(trpc.stats.homepage.queryOptions());
	prefetch(trpc.leaderboard.preview.queryOptions());

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			<div className="mx-auto max-w-5xl px-10 py-20">
				{/* ── Hero ──────────────────────────────────────────────────── */}
				<section className="flex flex-col gap-3 mb-10">
					<div className="flex items-center gap-3">
						<span className="font-mono text-4xl font-bold text-emerald-500">$</span>
						<h1 className="font-mono text-4xl font-bold text-[var(--color-text-primary)]">
							paste your code. get roasted.
						</h1>
					</div>
					<p className="font-sans text-sm text-[var(--color-text-secondary)]">
						{"// drop your code below and we'll rate it — brutally honest or full roast mode"}
					</p>
				</section>

				{/* ── Code Input ────────────────────────────────────────────── */}
				<RoastForm />

				{/* ── Stats + Leaderboard via tRPC + Suspense ───────────────── */}
				<HydrateClient>
					<Suspense fallback={<StatsBarSkeleton />}>
						<HomepageStats />
					</Suspense>

					{/* ── Spacer ──────────────────────────────────────────────── */}
					<div className="h-16" />

					<Suspense fallback={<LeaderboardPreviewSkeleton />}>
						<HomepageLeaderboard />
					</Suspense>
				</HydrateClient>
			</div>
		</main>
	);
}
