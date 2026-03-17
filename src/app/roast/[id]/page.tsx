import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BundledLanguage } from "shiki";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { getRoastById } from "@/db/queries/roast";

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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const roast = await getRoastById(id);

	if (!roast) {
		return { title: "Roast Not Found — IsMyCodeTrash" };
	}

	const ogImageUrl = `/api/og/${id}`;

	return {
		title: `Roast Results — IsMyCodeTrash`,
		description: `"${roast.roastQuote}" — score: ${roast.score}/10`,
		openGraph: {
			title: "IsMyCodeTrash — Roast Results",
			description: roast.roastQuote,
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: `IsMyCodeTrash — score ${roast.score}/10: ${roast.verdict}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: "IsMyCodeTrash — Roast Results",
			description: roast.roastQuote,
			images: [ogImageUrl],
		},
	};
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RoastResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	"use cache";

	const { id } = await params;
	const roast = await getRoastById(id);

	if (!roast) notFound();

	const badgeVariant = verdictToBadgeVariant(roast.verdict);
	const hasDiff = roast.diffLines.length > 0;

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			<div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
				{/* ── Score Hero ────────────────────────────────────────────────── */}
				<section className="flex items-center gap-12">
					<ScoreRing score={roast.score} />
					<div className="flex flex-1 flex-col gap-4">
						<Badge variant={badgeVariant}>
							verdict: {roast.verdict.replace(/_/g, "_")}
						</Badge>
						<p className="font-sans text-xl leading-relaxed text-[var(--color-text-primary)]">
							&ldquo;{roast.roastQuote}&rdquo;
						</p>
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
							lang={roast.language as BundledLanguage}
							className="border-0"
						/>
					</div>
				</section>

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

				{/* ── Suggested Fix (diff) — only when AI produced a diff ──────── */}
				{hasDiff && (
					<>
						<div className="h-px bg-[var(--color-border-primary)]" />

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
								<div className="flex h-10 items-center gap-3 border-b border-[var(--color-border-primary)] px-4">
									<span
										className="size-2.5 rounded-full bg-red-500"
										aria-hidden
									/>
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
										your_code.{roast.language} → improved_code.{roast.language}
									</span>
								</div>
								<div>
									{roast.diffLines.map((line) => (
										<DiffLine key={line.id} type={line.type} code={line.code} />
									))}
								</div>
							</div>
						</section>
					</>
				)}
			</div>
		</main>
	);
}
