import { Suspense } from "react";
import { RoastForm } from "@/components/roast-form";
import { HomepageLeaderboard } from "@/components/homepage-leaderboard";
import { HomepageStats } from "@/components/homepage-stats";
import { LeaderboardPreviewSkeleton } from "@/components/ui/leaderboard-preview-skeleton";
import { StatsBarSkeleton } from "@/components/ui/stats-bar-skeleton";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-page)]">
      <div className="mx-auto max-w-5xl px-10 py-20">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 mb-10">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-4xl font-bold text-[var(--color-text-primary)]">
              Paste your code. get roasted.
            </h1>
          </div>
          <p className="font-sans text-sm text-[var(--color-text-secondary)]">
            {
              "drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </section>

        {/* ── Code Input ────────────────────────────────────────────── */}
        <RoastForm />

        {/* ── Stats animadas (cacheadas 1h) ─────────────────────────── */}
        <Suspense fallback={<StatsBarSkeleton />}>
          <HomepageStats />
        </Suspense>

        {/* ── Spacer ────────────────────────────────────────────────── */}
        <div className="h-16" />

        {/* ── Shame leaderboard preview (cacheado 1h) ───────────────── */}
        <Suspense fallback={<LeaderboardPreviewSkeleton />}>
          <HomepageLeaderboard />
        </Suspense>
      </div>
    </main>
  );
}
