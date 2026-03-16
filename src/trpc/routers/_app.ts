import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { statsRouter } from "./stats";

export const appRouter = createTRPCRouter({
	leaderboard: leaderboardRouter,
	stats: statsRouter,
});

export type AppRouter = typeof appRouter;
