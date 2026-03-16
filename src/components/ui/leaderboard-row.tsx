import type { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

const row = tv({
	base: [
		"flex flex-col gap-0",
		"border-b border-[var(--color-border-primary)] last:border-b-0",
	],
});

const scoreCell = tv({
	base: "font-mono text-[13px] font-bold tabular-nums",
	variants: {
		color: {
			critical: "text-red-500",
			warning: "text-amber-500",
			good: "text-[var(--color-accent)]",
		},
	},
});

const rankCell = tv({
	base: "font-mono text-[13px] shrink-0",
	variants: {
		top: {
			true: "text-amber-500 font-bold",
			false: "text-[var(--color-text-tertiary)]",
		},
	},
	defaultVariants: { top: false },
});

const scoreColor = (score: number): "critical" | "warning" | "good" => {
	if (score <= 3) return "critical";
	if (score <= 6) return "warning";
	return "good";
};

/** Retorna as primeiras N linhas não-vazias do código. */
function firstLines(code: string, n = 3): string[] {
	return code
		.split("\n")
		.map((l) => l) // preserve indent
		.filter((l) => l.trim() !== "")
		.slice(0, n);
}

export interface LeaderboardRowProps extends HTMLAttributes<HTMLDivElement> {
	rank: number;
	score: number;
	code: string;
	language: string;
}

export function LeaderboardRow({
	rank,
	score,
	code,
	language,
	className,
	...props
}: LeaderboardRowProps) {
	const lines = firstLines(code);

	return (
		<div className={row({ className })} {...props}>
			{/* ── Meta row ───────────────────────────────────────────────── */}
			<div className="flex items-center gap-4 px-5 pt-3 pb-2">
				<span className={rankCell({ top: rank === 1 })}>#{rank}</span>
				<span className={scoreCell({ color: scoreColor(score) })}>
					{score.toFixed(1)}
				</span>
				<span className="ml-auto font-mono text-xs text-[var(--color-text-tertiary)]">
					{language}
				</span>
			</div>

			{/* ── Code preview — 3 primeiras linhas com scroll horizontal ── */}
			<div className="overflow-x-auto px-5 pb-3 scrollbar-thin">
				<pre className="font-mono text-xs leading-5 text-[var(--color-text-secondary)] whitespace-pre">
					{lines.map((line, lineIndex) => {
						const lineNum = lineIndex + 1;
						return (
							<div key={`${rank}-${lineNum}`} className="flex gap-3 min-w-0">
								<span className="select-none w-4 shrink-0 text-right text-[var(--color-text-tertiary)] opacity-40">
									{lineNum}
								</span>
								<span>{line}</span>
							</div>
						);
					})}
				</pre>
			</div>
		</div>
	);
}
