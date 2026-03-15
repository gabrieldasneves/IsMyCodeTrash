import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { ScoreRing } from "@/components/ui/score-ring";
import { Toggle } from "@/components/ui/toggle";

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-1 border-b border-[var(--color-border-primary)] pb-3">
				<h2 className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
					{title}
				</h2>
				{description && (
					<p className="font-mono text-xs text-[var(--color-text-secondary)]">
						{description}
					</p>
				)}
			</div>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</section>
	);
}

function ComponentGroup({
	name,
	children,
}: {
	name: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-8">
			<h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
				{name}
			</h2>
			{children}
		</div>
	);
}

function Label({ tag, children }: { tag: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col items-start gap-2">
			{children}
			<span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
				{tag}
			</span>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ComponentsPage() {
	return (
		<div className="min-h-screen bg-[var(--color-bg-page)] px-10 py-12">
			{/* Header */}
			<div className="mb-12 flex flex-col gap-1">
				<p className="font-mono text-xs text-[var(--color-accent-green)]">
					{"// src/components/ui"}
				</p>
				<h1 className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">
					Component Showcase
				</h1>
				<p className="font-mono text-sm text-[var(--color-text-secondary)]">
					Visual reference for all UI components and their variants.
				</p>
			</div>

			<div className="flex flex-col gap-16">
				{/* ── Button ──────────────────────────────────────────────────── */}
				<ComponentGroup name="Button">
					<Section title="variant" description="Controls the visual style.">
						{(
							[
								"primary",
								"secondary",
								"outline",
								"ghost",
								"destructive",
							] as const
						).map((v) => (
							<Label key={v} tag={v}>
								<Button variant={v}>$ roast_my_code</Button>
							</Label>
						))}
					</Section>

					<Section title="size" description="Controls padding and font size.">
						{(["sm", "md", "lg"] as const).map((s) => (
							<Label key={s} tag={s}>
								<Button size={s}>$ roast_my_code</Button>
							</Label>
						))}
					</Section>

					<Section
						title="disabled"
						description="All variants in disabled state."
					>
						{(
							[
								"primary",
								"secondary",
								"outline",
								"ghost",
								"destructive",
							] as const
						).map((v) => (
							<Label key={v} tag={v}>
								<Button variant={v} disabled>
									$ roast_my_code
								</Button>
							</Label>
						))}
					</Section>
				</ComponentGroup>

				{/* ── Badge ───────────────────────────────────────────────────── */}
				<ComponentGroup name="Badge">
					<Section
						title="variant"
						description="Dot + label with semantic color."
					>
						{(["critical", "warning", "good", "info", "muted"] as const).map(
							(v) => (
								<Label key={v} tag={v}>
									<Badge variant={v}>{v}</Badge>
								</Label>
							),
						)}
					</Section>

					<Section title="custom label" description="Long text example.">
						<Label tag="critical / long">
							<Badge variant="critical">needs_serious_help</Badge>
						</Label>
						<Label tag="good / short">
							<Badge variant="good">ok</Badge>
						</Label>
					</Section>
				</ComponentGroup>

				{/* ── Toggle ──────────────────────────────────────────────────── */}
				<ComponentGroup name="Toggle">
					<Section title="checked / unchecked">
						<Label tag="checked">
							<Toggle label="roast mode" defaultChecked />
						</Label>
						<Label tag="unchecked">
							<Toggle label="roast mode" />
						</Label>
						<Label tag="no label">
							<Toggle defaultChecked />
						</Label>
						<Label tag="disabled">
							<Toggle label="roast mode" disabled />
						</Label>
					</Section>
				</ComponentGroup>

				{/* ── Analysis Card ───────────────────────────────────────────── */}
				<ComponentGroup name="AnalysisCard">
					<Section
						title="severity"
						description="Border accent follows severity."
					>
						<Label tag="critical">
							<AnalysisCard
								severity="critical"
								title="using var instead of const/let"
								description="the var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs. modern javascript uses const for immutable bindings and let for mutable ones."
								className="w-80"
							/>
						</Label>
						<Label tag="warning">
							<AnalysisCard
								severity="warning"
								title="missing error handling"
								description="async operations should be wrapped in try/catch to handle potential rejections and avoid unhandled promise errors at runtime."
								className="w-80"
							/>
						</Label>
						<Label tag="good">
							<AnalysisCard
								severity="good"
								title="good use of array methods"
								description="using map and filter instead of imperative loops keeps the code declarative and easier to read."
								className="w-80"
							/>
						</Label>
						<Label tag="info">
							<AnalysisCard
								severity="info"
								title="consider extracting helper"
								description="this logic appears in multiple places. extracting it into a shared utility function would reduce duplication."
								className="w-80"
							/>
						</Label>
					</Section>
				</ComponentGroup>

				{/* ── Code Block ──────────────────────────────────────────────── */}
				<ComponentGroup name="CodeBlock">
					<Section
						title="javascript"
						description="With CodeBlockHeader (filename + macOS dots) + CodeBlock."
					>
						<div className="w-[480px] border border-[var(--color-border-primary)]">
							<CodeBlockHeader fileName="calculate.js" />
							<CodeBlock
								lang="javascript"
								code={`function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`}
								className="border-0"
							/>
						</div>
					</Section>

					<Section title="typescript" description="Without filename header.">
						<CodeBlock
							lang="typescript"
							code={`type User = { id: string; name: string };

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}`}
							className="w-[480px]"
						/>
					</Section>
				</ComponentGroup>

				{/* ── Diff Line ───────────────────────────────────────────────── */}
				<ComponentGroup name="DiffLine">
					<Section title="type" description="removed / added / context.">
						<div className="w-[480px] border border-[var(--color-border-primary)]">
							<DiffLine type="removed" code="var total = 0;" />
							<DiffLine type="added" code="const total = 0;" />
							<DiffLine
								type="context"
								code="for (let i = 0; i < items.length; i++) {"
							/>
							<DiffLine type="context" code="  total += items[i].price;" />
							<DiffLine type="context" code="}" />
						</div>
					</Section>
				</ComponentGroup>

				{/* ── Leaderboard Row ─────────────────────────────────────────── */}
				<ComponentGroup name="LeaderboardRow">
					<Section
						title="score ranges"
						description="Color changes by score threshold."
					>
						<div className="w-full max-w-2xl border border-[var(--color-border-primary)]">
							<LeaderboardRow
								rank={1}
								score={2.1}
								codePreview="function calculateTotal(items) { var total = 0; ..."
								language="javascript"
							/>
							<LeaderboardRow
								rank={2}
								score={4.8}
								codePreview="class UserService { constructor(db) { this.db = db; ..."
								language="typescript"
							/>
							<LeaderboardRow
								rank={3}
								score={7.3}
								codePreview="const fetchUser = async (id) => await db.find(id);"
								language="typescript"
							/>
							<LeaderboardRow
								rank={4}
								score={9.1}
								codePreview="export const sum = (a: number, b: number) => a + b;"
								language="typescript"
							/>
						</div>
					</Section>
				</ComponentGroup>

				{/* ── Score Ring ──────────────────────────────────────────────── */}
				<ComponentGroup name="ScoreRing">
					<Section
						title="score ranges"
						description="Color follows score threshold (≤3 red, ≤6 amber, >6 green)."
					>
						<Label tag="score: 2.1 — critical">
							<ScoreRing score={2.1} />
						</Label>
						<Label tag="score: 5.0 — warning">
							<ScoreRing score={5.0} />
						</Label>
						<Label tag="score: 8.7 — good">
							<ScoreRing score={8.7} />
						</Label>
						<Label tag="score: 10.0 — perfect">
							<ScoreRing score={10} />
						</Label>
					</Section>
				</ComponentGroup>
			</div>
		</div>
	);
}
