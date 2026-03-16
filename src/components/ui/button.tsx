import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
	base: [
		"inline-flex items-center justify-center gap-2",
		"font-mono font-medium text-[13px]",
		"transition-colors duration-150",
		"cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
	],
	variants: {
		variant: {
			primary:
				"bg-emerald-500 text-zinc-950 not-disabled:hover:bg-emerald-400 focus-visible:ring-emerald-500",
			secondary:
				"bg-zinc-800 text-zinc-100 not-disabled:hover:bg-zinc-700 focus-visible:ring-zinc-500",
			outline:
				"border border-emerald-500 text-emerald-500 bg-transparent not-disabled:hover:bg-emerald-500 not-disabled:hover:text-zinc-950 focus-visible:ring-emerald-500",
			ghost:
				"bg-transparent text-zinc-400 not-disabled:hover:bg-zinc-800 not-disabled:hover:text-zinc-100 focus-visible:ring-zinc-500",
			destructive:
				"bg-red-600 text-zinc-50 not-disabled:hover:bg-red-500 focus-visible:ring-red-500",
		},
		size: {
			sm: "px-3 py-1.5 text-xs",
			md: "px-6 py-2.5",
			lg: "px-8 py-3 text-sm",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		ButtonVariants {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
	return <button className={button({ variant, size, className })} {...props} />;
}
