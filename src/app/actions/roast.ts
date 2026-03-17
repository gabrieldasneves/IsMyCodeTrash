"use server";

import hljs from "highlight.js";
import { redirect } from "next/navigation";
import { createRoast } from "@/db/queries/roast";
import { analyzeCode } from "@/lib/ai";
import { hljsToShiki } from "@/lib/languages";

export async function submitRoast(formData: FormData) {
	const code = (formData.get("code") as string | null)?.trim() ?? "";
	const roastMode = formData.get("roastMode") === "on";

	// ── Validation ────────────────────────────────────────────────────────────
	if (!code || code.length < 10) return;
	if (code.length > 10_000) return;

	// ── Language detection ────────────────────────────────────────────────────
	const detected = hljs.highlightAuto(code);
	const language = hljsToShiki(detected.language) ?? "plaintext";

	// ── AI analysis ───────────────────────────────────────────────────────────
	const analysis = await analyzeCode(code, roastMode);

	// ── Persist ───────────────────────────────────────────────────────────────
	const roast = await createRoast({
		code,
		language,
		score: analysis.score,
		verdict: analysis.verdict,
		roastQuote: analysis.roastQuote,
		issues: analysis.issues,
		suggestedFix: analysis.diffLines,
	});

	// ── Redirect to result page ───────────────────────────────────────────────
	redirect(`/roast/${roast.id}`);
}
