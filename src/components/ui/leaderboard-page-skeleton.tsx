import { LeaderboardEntrySkeleton } from "@/components/ui/leaderboard-entry-skeleton";

// Skeleton da página completa de leaderboard — stats row + N entry skeletons.
export function LeaderboardPageSkeleton() {
	return (
		<>
			{/* Stats row */}
			<div className="flex items-center gap-2">
				<div className="h-3 w-28 animate-pulse rounded bg-[var(--color-border-primary)]" />
				<div className="h-3 w-1 animate-pulse rounded bg-[var(--color-border-primary)]" />
				<div className="h-3 w-24 animate-pulse rounded bg-[var(--color-border-primary)]" />
			</div>

			{/* Entry skeletons */}
			<section className="flex flex-col gap-5">
				{(["s1", "s2", "s3", "s4", "s5"] as const).map((key) => (
					<LeaderboardEntrySkeleton key={key} />
				))}
			</section>
		</>
	);
}
