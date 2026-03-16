import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badge = tv({
	base: "inline-flex items-center gap-2 font-mono text-xs",
	variants: {
		variant: {
			critical: "text-red-500",
			warning: "text-amber-500",
			good: "text-[var(--color-accent)]",
			info: "text-blue-400",
			muted: "text-[var(--color-text-tertiary)]",
		},
	},
	defaultVariants: {
		variant: "muted",
	},
});

const dot = tv({
	base: "size-2 shrink-0 rounded-full",
	variants: {
		variant: {
			critical: "bg-red-500",
			warning: "bg-amber-500",
			good: "bg-[var(--color-accent)]",
			info: "bg-blue-400",
			muted: "bg-[var(--color-text-tertiary)]",
		},
	},
	defaultVariants: {
		variant: "muted",
	},
});

type BadgeVariants = VariantProps<typeof badge>;

export interface BadgeProps
	extends HTMLAttributes<HTMLSpanElement>,
		BadgeVariants {}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
	return (
		<span className={badge({ variant, className })} {...props}>
			<span className={dot({ variant })} aria-hidden />
			{children}
		</span>
	);
}
