// Skeleton do shame_leaderboard preview da homepage.
// Espelha o layout exato do HomepageLeaderboard para evitar layout shift.
export function LeaderboardPreviewSkeleton() {
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
				{/* Botão placeholder com mesmas dimensões do Button outline sm */}
				<div className="h-8 w-28 animate-pulse rounded border border-[var(--color-border-primary)] bg-[var(--color-border-primary)]" />
			</div>

			{/* ── Subtitle ────────────────────────────────────────────────── */}
			<div className="h-4 w-72 animate-pulse rounded bg-[var(--color-border-primary)]" />

			{/* ── Table ───────────────────────────────────────────────────── */}
			<div className="border border-[var(--color-border-primary)]">
				{/* Table header */}
				<div className="flex h-10 items-center gap-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] px-5">
					<span className="w-10 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">#</span>
					<span className="w-14 shrink-0 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">score</span>
					<span className="flex-1 font-mono text-xs font-medium text-[var(--color-text-tertiary)]">code</span>
					<span className="w-24 shrink-0 text-right font-mono text-xs font-medium text-[var(--color-text-tertiary)]">lang</span>
				</div>

				{/* 3 row skeletons — mesmas dimensões do LeaderboardRow (py-4) */}
				{(["row-1", "row-2", "row-3"] as const).map((key, i) => (
					<div
						key={key}
						className="flex items-center gap-6 border-b border-[var(--color-border-primary)] px-5 py-4 last:border-b-0"
					>
						{/* rank */}
						<div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[var(--color-border-primary)]" />
						{/* score */}
						<div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[var(--color-border-primary)]" />
						{/* code preview — largura variável para parecer texto real */}
						<div
							className="h-3 flex-1 animate-pulse rounded bg-[var(--color-border-primary)]"
							style={{ maxWidth: `${60 + i * 15}%` }}
						/>
						{/* lang */}
						<div className="h-3 w-16 shrink-0 animate-pulse rounded bg-[var(--color-border-primary)]" />
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
