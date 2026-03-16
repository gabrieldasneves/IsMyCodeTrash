"use client";

import { Switch } from "@base-ui/react/switch";
import { tv } from "tailwind-variants";
import { useTheme } from "@/context/theme";

// ─── Styles ───────────────────────────────────────────────────────────────────

const track = tv({
	base: [
		"relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px]",
		"transition-colors duration-200 outline-none",
		"bg-[var(--color-border-primary)]",
		"data-[checked]:bg-[var(--color-accent)]",
		"focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
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

// ─── Component ────────────────────────────────────────────────────────────────

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const isLight = theme === "light";

	return (
		<div className="flex items-center gap-2.5">
			<Switch.Root
				id="theme-toggle"
				checked={isLight}
				onCheckedChange={toggleTheme}
				aria-label="Toggle light mode"
				className={track()}
			>
				<Switch.Thumb className={thumb()} />
			</Switch.Root>
			<label
				htmlFor="theme-toggle"
				className="cursor-pointer select-none font-mono text-xs text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
			>
				{isLight ? "light" : "dark"}
			</label>
		</div>
	);
}
