import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Evita refetch imediato no cliente após SSR
				staleTime: 30 * 1_000,
			},
			dehydrate: {
				// Inclui queries ainda pendentes para suporte a streaming/Suspense
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
		},
	});
}
