import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
	base: "flex items-baseline gap-2 px-4 py-2 font-mono text-[13px]",
	variants: {
		type: {
			added: "bg-[#0A1A0F] text-[var(--color-text-primary)]",
			removed: "bg-[#1A0A0A] text-[var(--color-text-secondary)]",
			context: "bg-transparent text-[var(--color-text-secondary)]",
		},
	},
	defaultVariants: {
		type: "context",
	},
});

const prefix = tv({
	base: "select-none shrink-0 w-3 text-center",
	variants: {
		type: {
			added: "text-emerald-500",
			removed: "text-red-500",
			context: "text-[var(--color-text-tertiary)]",
		},
	},
	defaultVariants: {
		type: "context",
	},
});

const PREFIXES = { added: "+", removed: "-", context: " " } as const;

type DiffLineVariants = VariantProps<typeof diffLine>;

export interface DiffLineProps
	extends HTMLAttributes<HTMLDivElement>,
		DiffLineVariants {
	code: string;
}

export function DiffLine({ type, code, className, ...props }: DiffLineProps) {
	const resolvedType = type ?? "context";
	return (
		<div className={diffLine({ type, className })} {...props}>
			<span className={prefix({ type })} aria-hidden>
				{PREFIXES[resolvedType]}
			</span>
			<span>{code}</span>
		</div>
	);
}
