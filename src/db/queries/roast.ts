import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import type { DiffLine, Roast, RoastIssue } from "@/db/schema";
import { diffLines, roastIssues, roasts } from "@/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRoastInput {
	// Código submetido
	code: string;
	language: string;
	// Output da IA (espelha RoastOutput do AI SDK)
	score: number;
	verdict: string;
	roastQuote: string;
	issues: Array<{
		severity: string;
		title: string;
		description: string;
	}>;
	suggestedFix: Array<{
		type: string;
		code: string;
	}> | null;
}

export interface RoastWithDetails extends Roast {
	issues: RoastIssue[];
	diffLines: DiffLine[];
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Busca um roast completo pelo ID — usado na página /roast/[id] após submit.
 * Faz 3 queries separadas e une no JS para evitar o uso de db.query (relations).
 */
export async function getRoastById(
	id: string,
): Promise<RoastWithDetails | null> {
	const [roast] = await db
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) return null;

	const [issues, diffs] = await Promise.all([
		db
			.select()
			.from(roastIssues)
			.where(eq(roastIssues.roastId, roast.id))
			.orderBy(asc(roastIssues.order)),
		db
			.select()
			.from(diffLines)
			.where(eq(diffLines.roastId, roast.id))
			.orderBy(asc(diffLines.lineNum)),
	]);

	return { ...roast, issues, diffLines: diffs };
}

/**
 * Busca um roast completo pelo slug — usado na página /roast/[slug] (Screen 2).
 * Faz 3 queries separadas e une no JS para evitar o uso de db.query (relations).
 */
export async function getRoastBySlug(
	slug: string,
): Promise<RoastWithDetails | null> {
	const [roast] = await db
		.select()
		.from(roasts)
		.where(eq(roasts.slug, slug))
		.limit(1);

	if (!roast) return null;

	const [issues, diffs] = await Promise.all([
		db
			.select()
			.from(roastIssues)
			.where(eq(roastIssues.roastId, roast.id))
			.orderBy(asc(roastIssues.order)),
		db
			.select()
			.from(diffLines)
			.where(eq(diffLines.roastId, roast.id))
			.orderBy(asc(diffLines.lineNum)),
	]);

	return { ...roast, issues, diffLines: diffs };
}

/**
 * Persiste um novo roast vindo da IA.
 * Executa dentro de uma transaction: roast + issues + diffLines atomicamente.
 * Retorna o roast criado (com o slug gerado) para redirecionar o usuário.
 */
export async function createRoast(
	input: CreateRoastInput,
): Promise<Pick<Roast, "id" | "slug">> {
	const slug = nanoid(12);
	const lineCount = input.code.split("\n").length;

	return db.transaction(async (tx) => {
		const [roast] = await tx
			.insert(roasts)
			.values({
				slug,
				code: input.code,
				language: input.language as Roast["language"],
				lineCount,
				score: input.score,
				verdict: input.verdict as Roast["verdict"],
				roastQuote: input.roastQuote,
				// suggestedFix raw é opcional; o diff estruturado vai em diff_lines
				suggestedFix: null,
			})
			.returning({ id: roasts.id, slug: roasts.slug });

		if (input.issues.length > 0) {
			await tx.insert(roastIssues).values(
				input.issues.map((issue, order) => ({
					roastId: roast.id,
					severity: issue.severity as RoastIssue["severity"],
					title: issue.title,
					description: issue.description,
					order,
				})),
			);
		}

		if (input.suggestedFix && input.suggestedFix.length > 0) {
			await tx.insert(diffLines).values(
				input.suggestedFix.map((line, lineNum) => ({
					roastId: roast.id,
					type: line.type as DiffLine["type"],
					code: line.code,
					lineNum,
				})),
			);
		}

		return roast;
	});
}
