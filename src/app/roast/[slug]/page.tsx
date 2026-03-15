import Link from "next/link";
import { notFound } from "next/navigation";
import type { BundledLanguage } from "shiki";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { getRoastBySlug } from "@/db/queries/roast";
import type { RoastIssue } from "@/db/schema";

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

function severityToVariant(
	severity: RoastIssue["severity"],
): "critical" | "warning" | "good" | "info" {
	return severity;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RoastPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const roast = await getRoastBySlug(slug);

	if (!roast) notFound();

	const badgeVariant = verdictToBadgeVariant(roast.verdict);
	// Coerce language to BundledLanguage; fall back to "text" for unknown values
	const lang = roast.language as BundledLanguage;

	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			{/* ── Navbar ────────────────────────────────────────────────────── */}
			<nav className="flex h-14 items-center justify-between border-b border-[var(--color-border-primary)] bg-[var(--color-bg-page)] px-10">
				<Link href="/" className="flex items-center gap-2">
					<span className="font-mono text-xl font-bold text-emerald-500">
						&gt;
					</span>
					<span className="font-mono text-lg font-medium text-[var(--color-text-primary)]">
						devroast
					</span>
				</Link>
				<Link href="/leaderboard">
					<span className="font-mono text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
						leaderboard
					</span>
				</Link>
			</nav>

			<div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
				{/* ── Score Hero ────────────────────────────────────────────── */}
				<section className="flex items-center gap-12">
					<ScoreRing score={roast.score} />

					<div className="flex flex-1 flex-col gap-4">
						<Badge variant={badgeVariant}>
							verdict: {roast.verdict.replace(/_/g, " ")}
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
						</div>
					</div>
				</section>

				{/* ── Divider ───────────────────────────────────────────────── */}
				<div className="h-px bg-[var(--color-border-primary)]" />

				{/* ── Submitted Code ────────────────────────────────────────── */}
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
						<CodeBlock code={roast.code} lang={lang} className="border-0" />
					</div>
				</section>

				{/* ── Divider ───────────────────────────────────────────────── */}
				<div className="h-px bg-[var(--color-border-primary)]" />

				{/* ── Detailed Analysis ─────────────────────────────────────── */}
				{roast.issues.length > 0 && (
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
									severity={severityToVariant(issue.severity)}
									title={issue.title}
									description={issue.description}
								/>
							))}
						</div>
					</section>
				)}

				{/* ── Divider + Diff ────────────────────────────────────────── */}
				{roast.diffLines.length > 0 && (
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
								{/* Diff header */}
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
										diff
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
					</>
				)}
			</div>
		</main>
	);
}
