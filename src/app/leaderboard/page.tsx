import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardPageContent } from "@/components/leaderboard-page-content";
import { LeaderboardPageSkeleton } from "@/components/ui/leaderboard-page-skeleton";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shame Leaderboard — IsMyCodeTrash",
  description:
    "The most roasted code on the internet. See which snippets earned the lowest scores in our public hall of shame.",
  openGraph: {
    title: "Shame Leaderboard — IsMyCodeTrash",
    description: "The most roasted code on the internet, ranked by shame.",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-page)]">
      <div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
        {/* ── Hero — estático, renderiza imediatamente ─────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
              shame leaderboard
            </h1>
          </div>
          <p className="font-sans text-sm text-[var(--color-text-secondary)]">
            {"The most roasted code on the internet"}
          </p>
        </section>

        {/* ── Conteúdo dinâmico: stats + entries ──────────────────────── */}
        <Suspense fallback={<LeaderboardPageSkeleton />}>
          <LeaderboardPageContent />
        </Suspense>
      </div>
    </main>
  );
}
