import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardEntry } from "@/components/ui/leaderboard-entry";

// ─── SSR Metadata (SEO) ───────────────────────────────────────────────────────

export const metadata: Metadata = {
	title: "Shame Leaderboard — CodeRoaster",
	description:
		"The most roasted code on the internet. See which snippets earned the lowest scores in our public hall of shame.",
	openGraph: {
		title: "Shame Leaderboard — CodeRoaster",
		description: "The most roasted code on the internet, ranked by shame.",
	},
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIC_ENTRIES = [
	{
		id: 1,
		rank: 1,
		score: 1.2,
		language: "javascript",
		lang: "javascript" as const,
		code: `eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`,
	},
	{
		id: 2,
		rank: 2,
		score: 1.8,
		language: "typescript",
		lang: "typescript" as const,
		code: `if (x == true) { return true; }\nelse if (x == false) { return false; }\nelse { return !false; }`,
	},
	{
		id: 3,
		rank: 3,
		score: 2.1,
		language: "sql",
		lang: "sql" as const,
		code: `SELECT * FROM users WHERE 1=1\n-- TODO: add authentication`,
	},
	{
		id: 4,
		rank: 4,
		score: 2.3,
		language: "java",
		lang: "java" as const,
		code: `catch (Exception e) {\n  // ignore\n}`,
	},
	{
		id: 5,
		rank: 5,
		score: 2.6,
		language: "javascript",
		lang: "javascript" as const,
		code: `const sleep = (ms) =>\n  new Date(Date.now() + ms)\n  while(new Date() < end) {}`,
	},
] as const;

const STATS = {
	totalSubmissions: "2,847",
	avgScore: "4.2/10",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
	return (
		<main className="min-h-screen bg-[var(--color-bg-page)]">
			<div className="mx-auto max-w-5xl px-10 py-10 flex flex-col gap-10">
				{/* ── Hero ────────────────────────────────────────────────────── */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-3xl font-bold text-emerald-500">
							&gt;
						</span>
						<h1 className="font-mono text-3xl font-bold text-[var(--color-text-primary)]">
							shame_leaderboard
						</h1>
					</div>

					<p className="font-sans text-sm text-[var(--color-text-secondary)]">
						{"// the most roasted code on the internet"}
					</p>

					<div className="flex items-center gap-2">
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							{STATS.totalSubmissions} submissions
						</span>
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							·
						</span>
						<span className="font-mono text-xs text-[var(--color-text-tertiary)]">
							avg score: {STATS.avgScore}
						</span>
					</div>
				</section>

				{/* ── Leaderboard Entries ─────────────────────────────────────── */}
				<section className="flex flex-col gap-5">
					{STATIC_ENTRIES.map((entry) => (
						<LeaderboardEntry
							key={entry.id}
							rank={entry.rank}
							score={entry.score}
							language={entry.language}
							code={entry.code}
							lang={entry.lang}
						/>
					))}
				</section>

				{/* ── Footer ──────────────────────────────────────────────────── */}
				<div className="flex items-center justify-center py-4">
					<Link
						href="/"
						className="font-mono text-xs text-[var(--color-text-tertiary)] transition-colors not-disabled:hover:text-[var(--color-text-secondary)]"
					>
						&lt; back to roaster
					</Link>
				</div>
			</div>
		</main>
	);
}
