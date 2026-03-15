import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIC_ROAST = {
	id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	score: 3.5,
	verdict: "needs_serious_help",
	roastQuote:
		"this code looks like it was written during a power outage... in 2005.",
	language: "javascript",
	lineCount: 16,
	code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
	issues: [
		{
			id: "issue-1",
			severity: "critical" as const,
			title: "using var instead of const/let",
			description:
				"var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
		},
		{
			id: "issue-2",
			severity: "warning" as const,
			title: "imperative loop pattern",
			description:
				"for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
		},
		{
			id: "issue-3",
			severity: "good" as const,
			title: "clear naming conventions",
			description:
				"calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
		},
		{
			id: "issue-4",
			severity: "good" as const,
			title: "single responsibility",
			description:
				"the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
		},
	],
	diffLines: [
		{
			id: "d1",
			type: "context" as const,
			code: "function calculateTotal(items) {",
		},
		{
			id: "d2",
			type: "removed" as const,
			code: "  var total = 0;",
		},
		{
			id: "d3",
			type: "removed" as const,
			code: "  for (var i = 0; i < items.length; i++) {",
		},
		{
			id: "d4",
			type: "removed" as const,
			code: "    total = total + items[i].price;",
		},
		{
			id: "d5",
			type: "removed" as const,
			code: "  }",
		},
		{
			id: "d6",
			type: "removed" as const,
			code: "  return total;",
		},
		{
			id: "d7",
			type: "added" as const,
			code: "  return items.reduce((sum, item) => sum + item.price, 0);",
		},
		{
			id: "d8",
			type: "context" as const,
			code: "}",
		},
	],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function verdictToBadgeVariant(
	verdict: string,
): "critical" | "warning" | "good" | "info" | "muted" {
	switch (verdict) {
		case "needs_serious_help":
		case "needs_help":
			return "critical";
		case "mediocre":
			return "warning";
		case "acceptable":
			return "info";
		case "excellent":
			return "good";
		default:
			return "muted";
	}
}

// ─── SSR Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Roast ${id.slice(0, 8)}… — CodeRoaster`,
		description: `"${STATIC_ROAST.roastQuote}" — score: ${STATIC_ROAST.score}/10`,
		openGraph: {
			title: "CodeRoaster — Roast Results",
			description: STATIC_ROAST.roastQuote,
		},
	};
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RoastResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	// UUID param — will be used to fetch from DB once real data is wired up
	await params;

	const roast = STATIC_ROAST;
	const badgeVariant = verdictToBadgeVariant(roast.verdict);

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			<div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
				{/* ── Score Hero ────────────────────────────────────────────────── */}
				<section className="flex items-center gap-12">
					<ScoreRing score={roast.score} />

					<div className="flex flex-1 flex-col gap-4">
						{/* Verdict badge */}
						<Badge variant={badgeVariant}>
							verdict: {roast.verdict.replace(/_/g, "_")}
						</Badge>

						{/* Roast quote */}
						<p className="font-sans text-xl leading-relaxed text-[var(--color-text-primary)]">
							&ldquo;{roast.roastQuote}&rdquo;
						</p>

						{/* Meta: lang · lines */}
						<div className="flex items-center gap-4">
							<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
								lang: {roast.language}
							</span>
							<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
								·
							</span>
							<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
								{roast.lineCount} {roast.lineCount === 1 ? "line" : "lines"}
							</span>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 pt-1">
							<Link href="/">
								<Button variant="outline" size="sm">
									$ roast_another
								</Button>
							</Link>
							<Button variant="ghost" size="sm">
								$ share_roast
							</Button>
						</div>
					</div>
				</section>

				{/* ── Divider ───────────────────────────────────────────────────── */}
				<div className="h-px bg-[var(--color-border-primary)]" />

				{/* ── Submitted Code ────────────────────────────────────────────── */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-emerald-500">
							{"//"}
						</span>
						<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
							your_submission
						</span>
					</div>

					<div className="border border-[var(--color-border-primary)]">
						<CodeBlockHeader />
						<CodeBlock
							code={roast.code}
							lang="javascript"
							className="border-0"
						/>
					</div>
				</section>

				{/* ── Divider ───────────────────────────────────────────────────── */}
				<div className="h-px bg-[var(--color-border-primary)]" />

				{/* ── Detailed Analysis ─────────────────────────────────────────── */}
				<section className="flex flex-col gap-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-emerald-500">
							{"//"}
						</span>
						<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
							detailed_analysis
						</span>
					</div>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						{roast.issues.map((issue) => (
							<AnalysisCard
								key={issue.id}
								severity={issue.severity}
								title={issue.title}
								description={issue.description}
							/>
						))}
					</div>
				</section>

				{/* ── Divider ───────────────────────────────────────────────────── */}
				<div className="h-px bg-[var(--color-border-primary)]" />

				{/* ── Suggested Fix (diff) ──────────────────────────────────────── */}
				<section className="flex flex-col gap-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-emerald-500">
							{"//"}
						</span>
						<span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
							suggested_fix
						</span>
					</div>

					<div className="overflow-hidden border border-[var(--color-border-primary)] bg-[var(--color-bg-input)]">
						{/* Diff header */}
						<div className="flex h-10 items-center gap-3 border-b border-[var(--color-border-primary)] px-4">
							<span className="size-2.5 rounded-full bg-red-500" aria-hidden />
							<span
								className="size-2.5 rounded-full bg-amber-500"
								aria-hidden
							/>
							<span
								className="size-2.5 rounded-full bg-emerald-500"
								aria-hidden
							/>
							<span className="flex-1" />
							<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
								your_code.js → improved_code.js
							</span>
						</div>

						{/* Diff lines */}
						<div>
							{roast.diffLines.map((line) => (
								<DiffLine key={line.id} type={line.type} code={line.code} />
							))}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
