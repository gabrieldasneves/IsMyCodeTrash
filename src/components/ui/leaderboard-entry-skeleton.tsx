// Skeleton de um LeaderboardEntry — espelha o layout da página de leaderboard completo.
export function LeaderboardEntrySkeleton() {
	return (
		<div className="border border-[var(--color-border-primary)]">
			{/* Meta row */}
			<div className="flex h-12 items-center justify-between border-b border-[var(--color-border-primary)] px-5">
				<div className="flex items-center gap-4">
					<div className="h-3 w-6 animate-pulse rounded bg-[var(--color-border-primary)]" />
					<div className="h-3 w-10 animate-pulse rounded bg-[var(--color-border-primary)]" />
				</div>
				<div className="flex items-center gap-3">
					<div className="h-3 w-16 animate-pulse rounded bg-[var(--color-border-primary)]" />
					<div className="h-3 w-10 animate-pulse rounded bg-[var(--color-border-primary)]" />
				</div>
			</div>
			{/* Code block area */}
			<div className="flex flex-col gap-2 p-4">
				<div className="h-3 w-4/5 animate-pulse rounded bg-[var(--color-border-primary)]" />
				<div className="h-3 w-3/5 animate-pulse rounded bg-[var(--color-border-primary)]" />
				<div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-border-primary)]" />
				<div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-border-primary)]" />
			</div>
		</div>
	);
}
