import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Badge } from "./badge";

const card = tv({
	base: [
		"flex flex-col gap-3 p-5",
		"border border-[var(--color-border-primary)]",
		"bg-[var(--color-bg-surface)]",
	],
	variants: {
		severity: {
			critical: "border-l-2 border-l-red-500",
			warning: "border-l-2 border-l-amber-500",
			good: "border-l-2 border-l-emerald-500",
			info: "border-l-2 border-l-blue-400",
		},
	},
});

type CardVariants = VariantProps<typeof card>;

export interface AnalysisCardProps
	extends HTMLAttributes<HTMLDivElement>,
		CardVariants {
	severity: NonNullable<CardVariants["severity"]>;
	title: string;
	description: string;
}

export function AnalysisCard({
	severity,
	title,
	description,
	className,
	...props
}: AnalysisCardProps) {
	return (
		<div className={card({ severity, className })} {...props}>
			<Badge variant={severity}>{severity}</Badge>
			<p className="font-mono text-[13px] font-normal text-[var(--color-text-primary)]">
				{title}
			</p>
			<p className="font-sans text-xs leading-relaxed text-[var(--color-text-secondary)]">
				{description}
			</p>
		</div>
	);
}
