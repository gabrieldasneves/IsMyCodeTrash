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
}

export function CodeEditor({
	placeholder = "// paste your code here...",
	defaultValue = "",
	className,
	name,
	onChange,
}: CodeEditorProps) {
	const highlighter = useHighlighter();

	const [code, setCode] = useState(defaultValue);
	const [detectedShiki, setDetectedShiki] = useState<string | null>(null);
	const [selectedShiki, setSelectedShiki] = useState<string | null>(null);
	const [highlightedHtml, setHighlightedHtml] = useState<string>("");

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const lineCount = Math.max(code.split("\n").length, MIN_LINES);

	// The language that actually drives the highlight
	const effectiveLang = selectedShiki ?? detectedShiki ?? null;

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

	// ── Sync textarea scroll with overlay ────────────────────────────────────
	const handleScroll = useCallback(() => {
		// nothing — both scroll together because textarea is on top
	}, []);

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
						className="size-3 rounded-full bg-emerald-500"
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

			{/* Body: line numbers + editor area */}
			<div className="relative flex flex-1">
				{/* Line numbers */}
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
				<div className="relative flex-1 overflow-hidden">
					{/* Highlighted code overlay — sits behind the textarea */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 overflow-hidden"
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
						onScroll={handleScroll}
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
