import type { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

const SIZE = 180;
const STROKE = 4;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const wrapper = tv({
	base: "relative inline-flex size-[180px] items-center justify-center",
});

const scoreNumber = tv({
	base: "font-mono text-5xl font-bold leading-none",
	variants: {
		color: {
			critical: "text-red-500",
			warning: "text-amber-500",
			good: "text-emerald-500",
		},
	},
});

const scoreColor = (score: number): "critical" | "warning" | "good" => {
	if (score <= 3) return "critical";
	if (score <= 6) return "warning";
	return "good";
};

const scoreStroke = {
	critical: "#EF4444",
	warning: "#F59E0B",
	good: "#10B981",
} as const;

export interface ScoreRingProps extends HTMLAttributes<HTMLDivElement> {
	score: number;
	maxScore?: number;
}

export function ScoreRing({
	score,
	maxScore = 10,
	className,
	...props
}: ScoreRingProps) {
	const progress = Math.min(Math.max(score / maxScore, 0), 1);
	const dash = CIRCUMFERENCE * progress;
	const color = scoreColor(score);

	return (
		<div className={wrapper({ className })} {...props}>
			<svg
				width={SIZE}
				height={SIZE}
				viewBox={`0 0 ${SIZE} ${SIZE}`}
				aria-label={`Score: ${score} out of ${maxScore}`}
				role="img"
			>
				{/* Track */}
				<circle
					cx={CENTER}
					cy={CENTER}
					r={RADIUS}
					fill="none"
					stroke="var(--color-border-primary)"
					strokeWidth={STROKE}
				/>

				{/* Progress arc */}
				<circle
					cx={CENTER}
					cy={CENTER}
					r={RADIUS}
					fill="none"
					stroke={scoreStroke[color]}
					strokeWidth={STROKE}
					strokeLinecap="butt"
					strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
					transform={`rotate(-90 ${CENTER} ${CENTER})`}
				/>
			</svg>

			{/* Center text */}
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
				<span className={scoreNumber({ color })}>{score.toFixed(1)}</span>
				<span className="font-mono text-base leading-none text-[var(--color-text-tertiary)]">
					/{maxScore}
				</span>
			</div>
		</div>
	);
}
