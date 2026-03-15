"use client";

import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

// Module-level singleton — shared across all component instances.
// Avoids re-creating the highlighter on every mount.
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = import("shiki").then(({ createHighlighter }) =>
			createHighlighter({
				themes: ["vesper"],
				langs: [],
			}),
		);
	}
	return highlighterPromise;
}

export function useHighlighter() {
	const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

	useEffect(() => {
		let cancelled = false;
		getHighlighter().then((h) => {
			if (!cancelled) setHighlighter(h);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return highlighter;
}
