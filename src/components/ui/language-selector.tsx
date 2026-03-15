"use client";

import { Select } from "@base-ui/react/select";
import { tv } from "tailwind-variants";
import { LANGUAGES } from "@/lib/languages";

// ─── Styles ──────────────────────────────────────────────────────────────────

const trigger = tv({
	base: [
		"flex items-center gap-1.5",
		"font-mono text-[11px] font-medium",
		"text-[var(--color-text-secondary)]",
		"not-disabled:hover:text-[var(--color-text-primary)]",
		"transition-colors duration-150 cursor-pointer",
		"select-none outline-none",
	],
});

const popup = tv({
	base: [
		"z-50 min-w-[140px] max-h-[260px] overflow-y-auto",
		"border border-[var(--color-border-primary)]",
		"bg-[var(--color-bg-elevated)]",
		"py-1",
		// animation
		"origin-[var(--transform-origin)]",
		"transition-[opacity,scale,transform] duration-150",
		"data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
		"data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
	],
});

const item = tv({
	base: [
		"flex items-center px-3 py-1.5",
		"font-mono text-[11px]",
		"text-[var(--color-text-secondary)]",
		"cursor-pointer outline-none select-none",
		"data-[highlighted]:bg-[var(--color-bg-input)]",
		"data-[highlighted]:text-[var(--color-text-primary)]",
		"data-[selected]:text-[var(--color-accent-green)]",
		"transition-colors duration-100",
	],
});

// ─── Component ───────────────────────────────────────────────────────────────

export interface LanguageSelectorProps {
	/** Currently active Shiki lang id, or null for auto-detect */
	value: string | null;
	/** Detected language label shown when value is null */
	detectedLabel?: string;
	onChange: (shikiId: string | null) => void;
	className?: string;
}

export function LanguageSelector({
	value,
	detectedLabel,
	onChange,
	className,
}: LanguageSelectorProps) {
	const displayLabel =
		value != null
			? (LANGUAGES.find((l) => l.shiki === value)?.label ?? value)
			: (detectedLabel ?? "auto");

	function handleValueChange(next: string | null) {
		onChange(next);
	}

	return (
		<Select.Root value={value} onValueChange={handleValueChange}>
			<Select.Trigger className={trigger({ className })}>
				<span>{displayLabel}</span>
				<ChevronIcon />
			</Select.Trigger>

			<Select.Portal>
				<Select.Positioner sideOffset={6} align="start">
					<Select.Popup className={popup()}>
						{/* Auto option — null means "auto-detect" */}
						<Select.Item value={null} className={item()}>
							<Select.ItemText>auto</Select.ItemText>
						</Select.Item>

						{/* Divider */}
						<div className="my-1 border-t border-[var(--color-border-primary)]" />

						{/* Language list */}
						{LANGUAGES.map((lang) => (
							<Select.Item
								key={lang.shiki}
								value={lang.shiki}
								className={item()}
							>
								<Select.ItemText>{lang.label}</Select.ItemText>
							</Select.Item>
						))}
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}

function ChevronIcon() {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			aria-hidden="true"
			className="text-[var(--color-text-tertiary)]"
		>
			<path
				d="M2 3.5L5 6.5L8 3.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
