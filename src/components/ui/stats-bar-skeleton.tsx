// Skeleton estático exibido pelo Suspense enquanto os dados de métricas carregam
export function StatsBarSkeleton() {
	return (
		<div className="flex w-full max-w-[780px] items-center justify-center gap-6 pt-2">
			<span className="h-3 w-32 animate-pulse rounded bg-[var(--color-border-primary)]" />
			<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
				·
			</span>
			<span className="h-3 w-28 animate-pulse rounded bg-[var(--color-border-primary)]" />
		</div>
	);
}
