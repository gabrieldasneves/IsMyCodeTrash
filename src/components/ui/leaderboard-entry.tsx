import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntryProps {
	rank: number;
	score: number;
	language: string;
	code: string;
	lang: BundledLanguage;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
	if (score <= 3) return "text-red-500";
	if (score <= 6) return "text-amber-500";
	return "text-[var(--color-accent)]";
}

function rankColor(rank: number) {
	return rank <= 3 ? "text-amber-500" : "text-[var(--color-text-tertiary)]";
}

function lineCount(code: string) {
	return code.trim().split("\n").length;
}

// ─── Component (async Server Component) ──────────────────────────────────────

export async function LeaderboardEntry({
	rank,
	score,
	language,
	code,
	lang,
}: LeaderboardEntryProps) {
	const lines = lineCount(code);

	return (
		<article className="border border-[var(--color-border-primary)]">
			{/* ── Meta Row ──────────────────────────────────────────────────── */}
			<div className="flex h-12 items-center justify-between border-b border-[var(--color-border-primary)] px-5">
				{/* Left: rank + score */}
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[13px] text-[var(--color-text-tertiary)]">
							#
						</span>
						<span
							className={`font-mono text-[13px] font-bold ${rankColor(rank)}`}
						>
							{rank}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							score:
						</span>
						<span
							className={`font-mono text-[13px] font-bold ${scoreColor(score)}`}
						>
							{score.toFixed(1)}
						</span>
					</div>
				</div>

				{/* Right: language + lines */}
				<div className="flex items-center gap-3">
					<span className="font-mono text-xs text-[var(--color-text-secondary)]">
						{language}
					</span>
					<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
						{lines} {lines === 1 ? "line" : "lines"}
					</span>
				</div>
			</div>

			{/* ── Code Block ────────────────────────────────────────────────── */}
			<CodeBlock code={code} lang={lang} className="border-0" />
		</article>
	);
}
