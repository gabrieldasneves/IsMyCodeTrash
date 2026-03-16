import { avg, count, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import { roasts } from "@/db/schema";

/**
 * Retorna o total de roasts — exibido na homepage como "X codes roasted".
 */
export async function getTotalRoasts(): Promise<number> {
	const [result] = await db.select({ value: count() }).from(roasts);
	return result?.value ?? 0;
}

/**
 * Retorna o score médio de todos os roasts com 1 casa decimal.
 * Exibido na homepage como "avg score: X.X/10".
 * Retorna null se não houver roasts ainda.
 */
export async function getAverageScore(): Promise<number | null> {
	const [result] = await db
		.select({
			value: sql<number>`round(${avg(roasts.score)}::numeric, 1)`,
		})
		.from(roasts);

	return result?.value ?? null;
}

/**
 * Combina total + média em uma única query para a homepage.
 * Preferível a duas queries separadas quando ambos os valores são necessários.
 */
export async function getHomepageStats(): Promise<{
	totalRoasts: number;
	averageScore: number | null;
}> {
	"use cache";
	cacheLife("hours");

	const [result] = await db
		.select({
			totalRoasts: count(),
			averageScore: sql<number>`round(${avg(roasts.score)}::numeric, 1)`,
		})
		.from(roasts);

	return {
		totalRoasts: result?.totalRoasts ?? 0,
		averageScore: result?.averageScore ?? null,
	};
}
