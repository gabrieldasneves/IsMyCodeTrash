import "server-only";
import { initTRPC } from "@trpc/server";
import { cache } from "react";

// Contexto cacheado por request via React cache() — sem autenticação por ora
export const createTRPCContext = cache(async () => {
	return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
