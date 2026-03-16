import { asc, count } from "drizzle-orm";
import { db } from "@/db";
import type { Roast } from "@/db/schema";
import { roasts } from "@/db/schema";

// Campos expostos no leaderboard — código completo não é exibido no Screen 3
export type LeaderboardEntry = Pick<
	Roast,
	| "id"
	| "slug"
	| "score"
	| "verdict"
	| "language"
	| "lineCount"
	| "roastQuote"
	| "createdAt"
>;

// Entrada do preview da homepage — inclui o código para exibição
export type LeaderboardPreviewEntry = LeaderboardEntry & Pick<Roast, "code">;

/**
 * Retorna os roasts ordenados por score ASC (pior score = topo do leaderboard).
 * Todos os roasts são públicos — sem filtro de visibilidade.
 * Usado no Screen 3 (Shame Leaderboard) e no preview da homepage.
 */
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
	return db
		.select({
			id: roasts.id,
			slug: roasts.slug,
			score: roasts.score,
			verdict: roasts.verdict,
			language: roasts.language,
			lineCount: roasts.lineCount,
			roastQuote: roasts.roastQuote,
			createdAt: roasts.createdAt,
		})
		.from(roasts)
		.orderBy(asc(roasts.score))
		.limit(limit);
}

/**
 * Retorna os 3 piores roasts (com código) + total de roasts em paralelo.
 * Usado exclusivamente no preview da homepage via tRPC.
 */
export async function getLeaderboardPreview(): Promise<{
	entries: LeaderboardPreviewEntry[];
	totalRoasts: number;
}> {
	const [entries, [{ value: totalRoasts }]] = await Promise.all([
		db
			.select({
				id: roasts.id,
				slug: roasts.slug,
				score: roasts.score,
				verdict: roasts.verdict,
				language: roasts.language,
				lineCount: roasts.lineCount,
				roastQuote: roasts.roastQuote,
				createdAt: roasts.createdAt,
				code: roasts.code,
			})
			.from(roasts)
			.orderBy(asc(roasts.score))
			.limit(3),
		db.select({ value: count() }).from(roasts),
	]);

	return { entries, totalRoasts: totalRoasts ?? 0 };
}
