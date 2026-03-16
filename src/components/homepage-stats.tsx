import { cacheLife } from "next/cache";
import { caller } from "@/trpc/server";
import { StatsBar } from "@/components/ui/stats-bar";

export async function HomepageStats() {
	"use cache";
	cacheLife("hours");

	const { totalRoasts, averageScore } = await caller.stats.homepage();

	return <StatsBar totalRoasts={totalRoasts} averageScore={averageScore} />;
}
