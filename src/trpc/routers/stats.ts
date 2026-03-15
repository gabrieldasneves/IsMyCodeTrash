import { getHomepageStats } from "@/db/queries/stats";
import { baseProcedure, createTRPCRouter } from "../init";

export const statsRouter = createTRPCRouter({
	homepage: baseProcedure.query(async () => {
		return getHomepageStats();
	}),
});
