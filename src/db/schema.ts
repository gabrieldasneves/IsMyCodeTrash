import {
	index,
	integer,
	pgEnum,
	pgTable,
	real,
	smallint,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const verdictEnum = pgEnum("verdict", [
	"excellent", // score >= 8.0 — código decente
	"acceptable", // score >= 6.0 — passa, mas dá pra melhorar
	"mediocre", // score >= 4.0 — problemático
	"needs_help", // score >= 2.5 — bem ruim
	"needs_serious_help", // score < 2.5 — catastrófico
]);

export const severityEnum = pgEnum("severity", [
	"critical", // problema grave (accent-red no design)
	"warning", // atenção necessária (accent-amber)
	"good", // ponto positivo (accent-green)
	"info", // observação neutra
]);

export const languageEnum = pgEnum("language", [
	"typescript",
	"javascript",
	"tsx",
	"jsx",
	"python",
	"go",
	"rust",
	"java",
	"kotlin",
	"swift",
	"cpp",
	"csharp",
	"php",
	"ruby",
	"scala",
	"html",
	"css",
	"scss",
	"json",
	"yaml",
	"sql",
	"bash",
	"dockerfile",
	"markdown",
	"graphql",
	"prisma",
	"vue",
	"svelte",
	"plaintext", // fallback quando a detecção não identifica
]);

export const diffTypeEnum = pgEnum("diff_type", [
	"removed", // linha removida (DiffLine type="removed")
	"added", // linha adicionada (DiffLine type="added")
	"context", // linha de contexto (DiffLine type="context")
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * roasts — submissão principal.
 * Cada submissão é anônima e entra automaticamente no leaderboard público.
 */
export const roasts = pgTable(
	"roasts",
	{
		id: uuid().defaultRandom().primaryKey(),

		// Código submetido
		code: text().notNull(),
		language: languageEnum().notNull().default("plaintext"),
		lineCount: integer().notNull(),

		// Resultado da IA
		score: real().notNull(), // 0.0 – 10.0
		verdict: verdictEnum().notNull(),
		roastQuote: text().notNull(), // frase de impacto (Score Hero + OG image)
		suggestedFix: text(), // patch raw opcional; linhas estruturadas ficam em diff_lines

		// Compartilhamento
		slug: varchar({ length: 12 }).notNull().unique(), // /roast/[slug]

		// Timestamps
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		// Leaderboard ordena por score ASC em toda query — índice essencial
		index("roasts_score_idx").on(t.score),
		// slug tem UNIQUE constraint que já cria índice automaticamente no Postgres
	],
);

/**
 * roastIssues — cards de análise detalhada (Analysis Section, Screen 2).
 * Cada roast tem 2–6 issues com severity mapeada para AnalysisCard variants.
 */
export const roastIssues = pgTable("roast_issues", {
	id: uuid().defaultRandom().primaryKey(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),

	severity: severityEnum().notNull(),
	title: varchar({ length: 120 }).notNull(),
	description: text().notNull(),
	order: smallint().notNull(), // posição no Issues Grid (0-based)
});

/**
 * diffLines — linhas do suggested_fix (Diff Section, Screen 2).
 * Mapeadas 1:1 para o componente DiffLine.
 */
export const diffLines = pgTable("diff_lines", {
	id: uuid().defaultRandom().primaryKey(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),

	type: diffTypeEnum().notNull(),
	code: text().notNull(),
	lineNum: smallint().notNull(), // garante a ordem no Diff Block
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Roast = typeof roasts.$inferSelect;
export type NewRoast = typeof roasts.$inferInsert;

export type RoastIssue = typeof roastIssues.$inferSelect;
export type NewRoastIssue = typeof roastIssues.$inferInsert;

export type DiffLine = typeof diffLines.$inferSelect;
export type NewDiffLine = typeof diffLines.$inferInsert;
