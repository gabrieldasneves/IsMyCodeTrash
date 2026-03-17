// Skeleton do shame_leaderboard preview da homepage.
// Espelha o layout exato do HomepageLeaderboard para evitar layout shift.
export function LeaderboardPreviewSkeleton() {
	// Comprimentos variados para as linhas de código skeleton
	const rowWidths = [
		["w-3/4", "w-1/2", "w-5/6"],
		["w-2/3", "w-4/5", "w-1/3"],
		["w-5/6", "w-2/5", "w-3/5"],
	] as const;

	return (
		<section className="flex flex-col gap-6">
			{/* ── Section header ─────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-bold text-emerald-500">
						{"//"}
					</span>
					<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
						shame leaderboard
					</span>
				</div>
				<div className="h-8 w-28 animate-pulse rounded border border-[var(--color-border-primary)] bg-[var(--color-border-primary)]" />
			</div>

			{/* ── Subtitle ────────────────────────────────────────────────── */}
			<div className="h-4 w-72 animate-pulse rounded bg-[var(--color-border-primary)]" />

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

				{/* 3 row skeletons espelhando o novo layout (meta + bloco de código) */}
				{(["row-1", "row-2", "row-3"] as const).map((key, rowIndex) => (
					<div
						key={key}
						className="flex flex-col gap-0 border-b border-[var(--color-border-primary)] last:border-b-0"
					>
						{/* Meta row: rank · score · lang */}
						<div className="flex items-center gap-4 px-5 pt-3 pb-2">
							<div className="h-3 w-5 animate-pulse rounded bg-[var(--color-border-primary)]" />
							<div className="h-3 w-7 animate-pulse rounded bg-[var(--color-border-primary)]" />
							<div className="ml-auto h-3 w-16 animate-pulse rounded bg-[var(--color-border-primary)]" />
						</div>
						{/* Code lines skeleton */}
						<div className="flex flex-col gap-1.5 px-5 pb-3">
							{rowWidths[rowIndex].map((width) => (
								<div
									key={`${key}-${width}`}
									className={`h-3 animate-pulse rounded bg-[var(--color-border-primary)] ${width}`}
								/>
							))}
						</div>
					</div>
				))}
			</div>

			{/* ── Footer de métricas ──────────────────────────────────────── */}
			<div className="flex items-center justify-center py-1">
				<div className="h-3 w-52 animate-pulse rounded bg-[var(--color-border-primary)]" />
			</div>
		</section>
	);
}
