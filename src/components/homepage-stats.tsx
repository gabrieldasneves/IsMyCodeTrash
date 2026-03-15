"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { StatsBar } from "@/components/ui/stats-bar";

export function HomepageStats() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.stats.homepage.queryOptions());

	return (
		<StatsBar
			totalRoasts={data.totalRoasts}
			averageScore={data.averageScore}
		/>
	);
}
