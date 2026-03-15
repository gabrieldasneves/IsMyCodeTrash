"use client";

import { Switch } from "@base-ui/react/switch";
import { tv } from "tailwind-variants";

// ─── Styles ───────────────────────────────────────────────────────────────────

const track = tv({
	base: [
		"relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px]",
		"transition-colors duration-200 outline-none",
		"bg-[var(--color-border-primary)]",
		"data-[checked]:bg-emerald-500",
		"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
		"focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
	],
});

const thumb = tv({
	base: [
		"block size-4 rounded-full",
		"bg-[var(--color-text-secondary)]",
		"transition-transform duration-200",
		"translate-x-0",
		"data-[checked]:translate-x-[18px] data-[checked]:bg-[#0A0A0A]",
	],
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToggleProps extends Omit<Switch.Root.Props, "className"> {
	label?: string;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Toggle({
	label: labelText,
	className,
	id,
	...props
}: ToggleProps) {
	const switchId =
		id ?? (labelText ? `toggle-${labelText.replace(/\s+/g, "-")}` : undefined);

	return (
		<div className="inline-flex items-center gap-3">
			<Switch.Root id={switchId} className={track({ className })} {...props}>
				<Switch.Thumb className={thumb()} />
			</Switch.Root>
			{labelText && (
				<label
					htmlFor={switchId}
					className="cursor-pointer select-none font-mono text-xs text-[var(--color-text-secondary)] transition-colors duration-200"
				>
					{labelText}
				</label>
			)}
		</div>
	);
}
