import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
	createTRPCOptionsProxy,
	type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// getQueryClient é estável por request (React cache)
export const getQueryClient = cache(makeQueryClient);

// Proxy para uso em Server Components: trpc.stats.homepage.queryOptions()
export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

// Caller direto para Server Components que só precisam dos dados sem hidratar o cliente
export const caller = appRouter.createCaller(createTRPCContext);

// Wrapper conciso de HydrationBoundary para as pages
export function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{children}
		</HydrationBoundary>
	);
}

// Helper para prefetch tipado (suporta queries normais e infinitas)
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}
