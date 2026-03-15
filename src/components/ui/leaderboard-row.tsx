import type { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

const row = tv({
	base: [
		"flex items-center gap-6 px-5 py-4",
		"border-b border-[var(--color-border-primary)]",
		"font-mono text-[13px]",
	],
});

const scoreCell = tv({
	base: "w-14 shrink-0 font-bold",
	variants: {
		color: {
			critical: "text-red-500",
			warning: "text-amber-500",
			good: "text-emerald-500",
		},
	},
});

const rankCell = tv({
	base: "w-10 shrink-0 text-[13px]",
	variants: {
		top: {
			true: "text-amber-500",
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

export interface LeaderboardRowProps extends HTMLAttributes<HTMLDivElement> {
	rank: number;
	score: number;
	/** Single line of preview text shown in the code column. */
	codePreview: string;
	language: string;
}

export function LeaderboardRow({
	rank,
	score,
	codePreview,
	language,
	className,
	...props
}: LeaderboardRowProps) {
	return (
		<div className={row({ className })} {...props}>
			{/* Rank */}
			<span className={rankCell({ top: rank === 1 })}>#{rank}</span>

			{/* Score */}
			<span className={scoreCell({ color: scoreColor(score) })}>
				{score.toFixed(1)}
			</span>

			{/* Code preview */}
			<span className="flex-1 truncate text-xs text-[var(--color-text-primary)]">
				{codePreview}
			</span>

			{/* Language */}
			<span className="w-24 shrink-0 text-right text-xs text-[var(--color-text-tertiary)]">
				{language}
			</span>
		</div>
	);
}
