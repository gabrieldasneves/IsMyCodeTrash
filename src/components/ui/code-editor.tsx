"use client";

import hljs from "highlight.js/lib/common";
import { useCallback, useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useHighlighter } from "@/hooks/use-highlighter";
import { findLanguage, hljsToShiki } from "@/lib/languages";

// ─── Constants ───────────────────────────────────────────────────────────────

// Shared typographic values — must be identical between <textarea> and overlay <div>
const EDITOR_FONT_SIZE = "13px";
const EDITOR_LINE_HEIGHT = "24px"; // 1.846 × 13px ≈ 24px, integer value keeps alignment crisp
const EDITOR_PADDING = "16px";
const MIN_LINES = 16;
const MAX_LINES = 40; // ~960px body height before scroll kicks in

/** Maximum characters allowed in a code snippet (~80 lines of typical code) */
export const CODE_MAX_CHARS = 2000;

// ─── Styles ──────────────────────────────────────────────────────────────────

const wrapper = tv({
	base: [
		"flex flex-col overflow-hidden",
		"border border-[var(--color-border-primary)]",
		"bg-[var(--color-bg-input)]",
		"font-mono",
	],
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Detect language from raw code using highlight.js */
function detectLanguage(code: string): string | null {
	const lines = code.split("\n").filter((l) => l.trim().length > 0);
	if (lines.length < 3) return null;

	const result = hljs.highlightAuto(code);
	if (!result.language || (result.relevance ?? 0) < 5) return null;
	return hljsToShiki(result.language);
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface CodeEditorProps {
	placeholder?: string;
	defaultValue?: string;
	className?: string;
	name?: string;
	/** Called whenever the code content changes */
	onChange?: (code: string) => void;
	/** Called whenever the over-limit state changes */
	onLimitChange?: (overLimit: boolean) => void;
}

export function CodeEditor({
	placeholder = "// paste your code here...",
	defaultValue = "",
	className,
	name,
	onChange,
	onLimitChange,
}: CodeEditorProps) {
	const highlighter = useHighlighter();

	const [code, setCode] = useState(defaultValue);
	const [detectedShiki, setDetectedShiki] = useState<string | null>(null);
	const [selectedShiki, setSelectedShiki] = useState<string | null>(null);
	const [highlightedHtml, setHighlightedHtml] = useState<string>("");

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const lineCount = Math.max(code.split("\n").length, MIN_LINES);
	const charCount = code.length;
	const overLimit = charCount > CODE_MAX_CHARS;

	// The language that actually drives the highlight
	const effectiveLang = selectedShiki ?? detectedShiki ?? null;

	// ── Notify parent when over-limit state changes ───────────────────────────
	useEffect(() => {
		onLimitChange?.(overLimit);
	}, [overLimit, onLimitChange]);

	// ── Detect language whenever code changes ─────────────────────────────────
	useEffect(() => {
		if (!code.trim()) {
			setDetectedShiki(null);
			return;
		}
		const lang = detectLanguage(code);
		setDetectedShiki(lang);
	}, [code]);

	// ── Run Shiki highlight whenever code or effective language changes ────────
	useEffect(() => {
		if (!highlighter || !code.trim()) {
			setHighlightedHtml("");
			return;
		}

		let cancelled = false;

		async function render() {
			if (!highlighter) return;

			const lang = effectiveLang ?? "plaintext";

			// Lazy-load the language grammar if not yet loaded
			const loaded = highlighter.getLoadedLanguages();
			if (lang !== "plaintext" && !loaded.includes(lang as never)) {
				try {
					await highlighter.loadLanguage(lang as never);
				} catch {
					// Unknown language — fall back to plaintext
					if (!cancelled) setHighlightedHtml(escapePlaintext(code));
					return;
				}
			}

			if (cancelled) return;

			try {
				const html = highlighter.codeToHtml(code, {
					lang: lang === "plaintext" ? "text" : lang,
					theme: "vesper",
				});
				if (!cancelled) setHighlightedHtml(html);
			} catch {
				if (!cancelled) setHighlightedHtml(escapePlaintext(code));
			}
		}

		render();
		return () => {
			cancelled = true;
		};
	}, [highlighter, code, effectiveLang]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const next = e.target.value;
			setCode(next);
			onChange?.(next);
		},
		[onChange],
	);

	// ── Detected language label for the selector ──────────────────────────────
	const detectedLabel = detectedShiki
		? (findLanguage(detectedShiki)?.label ?? detectedShiki)
		: undefined;

	return (
		<div className={wrapper({ className })}>
			{/* Window chrome */}
			<div className="flex h-10 items-center justify-between border-b border-[var(--color-border-primary)] px-4">
				<div className="flex items-center gap-2">
					<span className="size-3 rounded-full bg-red-500" aria-hidden="true" />
					<span
						className="size-3 rounded-full bg-amber-500"
						aria-hidden="true"
					/>
					<span
						className="size-3 rounded-full bg-[var(--color-accent)]"
						aria-hidden="true"
					/>
				</div>

				{/* Language selector on the right side of the chrome bar */}
				<LanguageSelector
					value={selectedShiki}
					detectedLabel={detectedLabel}
					onChange={setSelectedShiki}
				/>
			</div>

			{/* Body: scroll container — caps height and scrolls line numbers + code together */}
			<div
				className="flex flex-1 overflow-y-auto"
				style={{ maxHeight: `${MAX_LINES * 24 + 32}px` }}
			>
				{/* Line numbers — grows with content */}
				<div
					className="shrink-0 select-none border-r border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] text-right"
					style={{
						padding: EDITOR_PADDING,
						paddingLeft: "12px",
						paddingRight: "12px",
					}}
					aria-hidden="true"
				>
					{Array.from({ length: lineCount }, (_, i) => {
						const lineNum = i + 1;
						return (
							<div
								key={lineNum}
								className="text-[var(--color-text-tertiary)]"
								style={{
									fontSize: EDITOR_FONT_SIZE,
									lineHeight: EDITOR_LINE_HEIGHT,
								}}
							>
								{lineNum}
							</div>
						);
					})}
				</div>

				{/* Editor area: overlay div (highlighted) + textarea (input) stacked */}
				<div className="relative flex-1">
					{/* Highlighted code overlay — absolutely fills the editor area */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0"
						style={{
							padding: EDITOR_PADDING,
							fontSize: EDITOR_FONT_SIZE,
							lineHeight: EDITOR_LINE_HEIGHT,
							fontFamily: "inherit",
							whiteSpace: "pre-wrap",
							wordBreak: "break-all",
						}}
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted
						dangerouslySetInnerHTML={{
							__html: highlightedHtml || escapePlaintext(code),
						}}
					/>

					{/* Transparent textarea on top — captures all user input */}
					<textarea
						ref={textareaRef}
						name={name}
						value={code}
						onChange={handleChange}
						placeholder={placeholder}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						data-enable-grammarly="false"
						className="relative z-10 w-full resize-none bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)]"
						style={{
							padding: EDITOR_PADDING,
							fontSize: EDITOR_FONT_SIZE,
							lineHeight: EDITOR_LINE_HEIGHT,
							fontFamily: "inherit",
							whiteSpace: "pre-wrap",
							wordBreak: "break-all",
							// Text is invisible — the overlay renders the visible content
							color: "transparent",
							caretColor: "var(--color-accent-green)",
							minHeight: `${lineCount * 24 + 32}px`,
						}}
					/>
				</div>
			</div>

			{/* Footer: character counter — bottom-right */}
			<div className="flex items-center justify-end border-t border-[var(--color-border-primary)] px-4 py-1.5">
				<span
					className={[
						"font-mono text-xs tabular-nums transition-colors",
						overLimit
							? "text-red-500"
							: charCount > CODE_MAX_CHARS * 0.85
								? "text-amber-500"
								: "text-[var(--color-text-tertiary)]",
					].join(" ")}
				>
					{charCount.toLocaleString("en-US")} /{" "}
					{CODE_MAX_CHARS.toLocaleString("en-US")}
				</span>
			</div>
		</div>
	);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Escape plain text so it's safe to inject as innerHTML */
function escapePlaintext(text: string): string {
	return text.replace(
		/[&<>"']/g,
		(ch) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				ch
			] ?? ch,
	);
}
