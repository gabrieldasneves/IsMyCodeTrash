import { getLeaderboardPreview } from "@/db/queries/leaderboard";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
	preview: baseProcedure.query(() => getLeaderboardPreview()),
});
