import { asc } from "drizzle-orm";
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
