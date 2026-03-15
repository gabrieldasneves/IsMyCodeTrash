import type { HTMLAttributes } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapper = tv({
	base: [
		"flex flex-col overflow-hidden font-mono text-[13px]",
		"border border-[var(--color-border-primary)]",
	],
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
	code: string;
	lang: BundledLanguage;
	fileName?: string;
}

// ─── Component (async Server Component) ──────────────────────────────────────

export async function CodeBlock({
	code,
	lang,
	fileName,
	className,
	...props
}: CodeBlockProps) {
	const html = await codeToHtml(code, {
		lang,
		theme: "vesper",
	});

	// Inject our design token as background, overriding Shiki's theme background
	const htmlWithTokenBg = html.replace(
		/(<pre[^>]*style=")[^"]*"/,
		`$1background-color:var(--color-bg-input);margin:0;padding:1rem;"`,
	);

	return (
		<div className={wrapper({ className })} {...props}>
			{/* Header */}
			<div className="flex h-10 items-center gap-3 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-input)] px-4">
				<span className="size-2.5 rounded-full bg-red-500" aria-hidden />
				<span className="size-2.5 rounded-full bg-amber-500" aria-hidden />
				<span className="size-2.5 rounded-full bg-emerald-500" aria-hidden />
				<span className="flex-1" />
				{fileName && (
					<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
						{fileName}
					</span>
				)}
			</div>

			{/* Highlighted code — rendered server-side by Shiki */}
			<div
				className="[&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe, generated server-side from trusted input
				dangerouslySetInnerHTML={{ __html: htmlWithTokenBg }}
			/>
		</div>
	);
}
