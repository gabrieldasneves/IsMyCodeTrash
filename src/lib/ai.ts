import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Response schema ──────────────────────────────────────────────────────────

export const roastResponseSchema = z.object({
	score: z
		.number()
		.min(0)
		.max(10)
		.describe("Code quality score from 0.0 (worst) to 10.0 (best), one decimal place"),
	verdict: z
		.enum(["excellent", "acceptable", "mediocre", "needs_help", "needs_serious_help"])
		.describe(
			"Verdict based on score: excellent (>=8), acceptable (>=6), mediocre (>=4), needs_help (>=2.5), needs_serious_help (<2.5)",
		),
	roastQuote: z
		.string()
		.max(200)
		.describe("One punchy sentence summarizing the code quality — the headline of the roast"),
	issues: z
		.array(
			z.object({
				severity: z
					.enum(["critical", "warning", "good", "info"])
					.describe("critical: serious problem, warning: needs attention, good: positive point, info: neutral observation"),
				title: z.string().max(80).describe("Short title of the issue (max 8 words)"),
				description: z
					.string()
					.max(300)
					.describe("Clear explanation of why this is an issue and what to do about it"),
			}),
		)
		.min(2)
		.max(6)
		.describe("List of code issues found. Always include at least one 'good' severity if the code has any redeeming qualities."),
	diffLines: z
		.array(
			z.object({
				type: z
					.enum(["removed", "added", "context"])
					.describe("removed: line to delete, added: line to add, context: unchanged surrounding line"),
				code: z.string().describe("The line of code (without leading +/- markers)"),
			}),
		)
		.nullable()
		.describe(
			"Unified diff showing the suggested fix. Include 1-2 context lines around changes. Return null if the code is already excellent or has no clear fix.",
		),
});

export type RoastResponse = z.infer<typeof roastResponseSchema>;

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(code: string, roastMode: boolean): string {
	const tone = roastMode
		? `You are a brutally sarcastic senior engineer who has seen every bad coding pattern imaginable. 
Your roastQuote should be savage and funny — think of a seasoned dev roasting a junior at a code review.
Your issue descriptions should be technically accurate but delivered with dry humor and mild contempt.
Do NOT be mean-spirited or personal — mock the code, not the developer.`
		: `You are a direct, no-nonsense senior engineer giving honest code review feedback.
Your roastQuote should be blunt and to the point — no sugarcoating, but also no sarcasm.
Your issue descriptions should be clear, technical, and actionable.`;

	return `${tone}

Analyze the following code snippet and return a structured review.

SCORING GUIDE:
- 9-10: Production-ready, idiomatic, well-structured
- 7-8: Solid code with minor improvements possible  
- 5-6: Works but has notable issues worth fixing
- 3-4: Multiple problems, needs significant rework
- 1-2: Serious issues, security risks, or fundamentally broken patterns
- 0-1: Catastrophic — eval, SQL injection, undefined behavior, etc.

RULES:
- Score must reflect the actual quality honestly. Don't be overly harsh or lenient.
- roastQuote must be a single sentence, max 200 chars.
- Include 2-6 issues. Mix severities — even bad code usually has SOMETHING right.
- diffLines should show the most impactful fix, not a complete rewrite. Keep diffs focused.
- If the code is truly excellent (score >= 8), set diffLines to null.
- All text must be lowercase (this is the aesthetic of the app).

CODE TO ANALYZE:
\`\`\`
${code}
\`\`\``;
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function analyzeCode(code: string, roastMode: boolean): Promise<RoastResponse> {
	const { object } = await generateObject({
		model: openai("gpt-4o-mini"),
		schema: roastResponseSchema,
		prompt: buildPrompt(code, roastMode),
		temperature: roastMode ? 0.9 : 0.4,
	});

	return object;
}
