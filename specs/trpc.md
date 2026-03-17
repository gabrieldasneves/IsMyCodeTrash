# Spec: tRPC como camada API

## Contexto

O projeto usa Server Actions (`src/app/actions/roast.ts`) e queries diretas do Drizzle nos Server Components. Essa abordagem funciona para mutações simples, mas à medida que o app cresce (página de resultado, leaderboard, stats), precisamos de uma camada de API centralizada, tipada end-to-end e consumível tanto de Server Components (SSR) quanto de Client Components (React Query).

tRPC v11 com `@trpc/tanstack-react-query` resolve isso: o mesmo router é chamado diretamente no servidor (zero HTTP) e via `httpBatchLink` no cliente, mantendo o mesmo contrato de tipos em ambos.

---

## Decisão

**tRPC v11 + TanStack React Query (nova integração)** — não a integração clássica `@trpc/react-query`.

A nova integração (`@trpc/tanstack-react-query`) é mais próxima do TanStack Query nativo: expõe `queryOptions()` e `mutationOptions()` em vez de hooks próprios. Isso permite usar `prefetchQuery` em Server Components e `useQuery`/`useSuspenseQuery` em Client Components com o mesmo `queryKey` — suportando o padrão de streaming do Next.js App Router.

**Por que não manter só Server Actions?**
Actions são ótimas para mutações com `redirect`, mas não expõem dados estruturados para Client Components sem boilerplate manual. tRPC unifica queries e mutations com type-safety automática e integração com React Query (cache, loading states, invalidação).

**Por que não REST/Route Handlers?**
Route Handlers exigiriam escrever schemas de validação, serialização de erro e tipos manualmente no cliente. tRPC faz tudo isso automaticamente a partir do router.

---

## Especificação

### Dependências a instalar

```bash
npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query server-only client-only
```

> `zod` já está no projeto. `@tanstack/react-query` será adicionado — o tRPC não usa mais um pacote próprio de hooks.

---

### Estrutura de arquivos

```
src/
  trpc/
    init.ts            ← initTRPC + createTRPCContext (server-only)
    query-client.ts    ← makeQueryClient() compartilhado server/client
    server.ts          ← trpc proxy, getQueryClient, HydrateClient, prefetch (server-only)
    client.tsx         ← TRPCReactProvider, useTRPC (client-only, "use client")
    routers/
      _app.ts          ← appRouter raiz (combina sub-routers)
      roast.ts         ← procedures de roast
      leaderboard.ts   ← procedures de leaderboard
      stats.ts         ← procedures de stats
  app/
    api/
      trpc/
        [trpc]/
          route.ts     ← fetch adapter (GET + POST)
    layout.tsx         ← monta TRPCReactProvider
```

---

### `src/trpc/init.ts`

```typescript
import "server-only";
import { initTRPC } from "@trpc/server";
import { cache } from "react";

// O contexto é cacheado por request via React cache()
export const createTRPCContext = cache(async () => {
  // Sem autenticação no IsMyCodeTrash — contexto vazio por ora.
  // Futuramente: headers, rate limiting, etc.
  return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

---

### `src/trpc/query-client.ts`

```typescript
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1_000, // evita refetch imediato no cliente após SSR
      },
      dehydrate: {
        // inclui queries ainda pendentes (suporte a streaming/Suspense)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
```

---

### `src/trpc/server.ts`

```typescript
import "server-only";
import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy, type TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// getQueryClient é estável por request (React cache)
export const getQueryClient = cache(makeQueryClient);

// Proxy para uso em Server Components: trpc.roast.getBySlug.queryOptions(...)
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Caller direto para Server Components que só precisam dos dados (não hidratam no cliente)
export const caller = appRouter.createCaller(createTRPCContext);

// Wrapper de HydrationBoundary para uso conciso nas pages
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
```

---

### `src/trpc/client.tsx`

```typescript
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc` })],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

---

### `src/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

---

### `src/trpc/routers/_app.ts`

```typescript
import { createTRPCRouter } from "../init";
import { roastRouter } from "./roast";
import { leaderboardRouter } from "./leaderboard";
import { statsRouter } from "./stats";

export const appRouter = createTRPCRouter({
  roast: roastRouter,
  leaderboard: leaderboardRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
```

---

### Routers — contratos de procedure

**`src/trpc/routers/roast.ts`**
```typescript
// Procedures:
// roast.submit — mutation: { code, language } → { slug } (substitui Server Action)
// roast.getBySlug — query: { slug } → RoastWithIssuesAndDiff | null
```

**`src/trpc/routers/leaderboard.ts`**
```typescript
// Procedures:
// leaderboard.list — query: { limit?: number } → LeaderboardEntry[]
```

**`src/trpc/routers/stats.ts`**
```typescript
// Procedures:
// stats.homepage — query: void → { totalRoasts, averageScore }
```

---

### Padrão de uso — Server Component com prefetch

```typescript
// src/app/page.tsx
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export default function HomePage() {
  prefetch(trpc.leaderboard.list.queryOptions({ limit: 3 }));
  prefetch(trpc.stats.homepage.queryOptions());

  return (
    <HydrateClient>
      <LeaderboardPreview />  {/* Client Component usa useSuspenseQuery */}
      <StatsBar />            {/* Client Component usa useQuery */}
    </HydrateClient>
  );
}
```

### Padrão de uso — Client Component

```typescript
"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function LeaderboardPreview() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.leaderboard.list.queryOptions({ limit: 3 }));
  return <ul>{data.map(entry => <LeaderboardRow key={entry.id} {...entry} />)}</ul>;
}
```

### Padrão de uso — Server Component com dados diretos (sem hidratação)

```typescript
// Quando o Client Component não precisa dos dados — só o servidor usa
import { caller } from "@/trpc/server";

export default async function RoastPage({ params }) {
  const roast = await caller.roast.getBySlug({ slug: params.slug });
  if (!roast) notFound();
  return <RoastResult roast={roast} />;
}
```

---

### Provider no layout raiz

```typescript
// src/app/layout.tsx
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
```

---

## To-dos de Implementação

### Infraestrutura

- [ ] Instalar dependências: `npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query server-only client-only`
- [ ] Criar `src/trpc/init.ts`
- [ ] Criar `src/trpc/query-client.ts`
- [ ] Criar `src/trpc/server.ts` com `trpc`, `getQueryClient`, `HydrateClient`, `prefetch`, `caller`
- [ ] Criar `src/trpc/client.tsx` com `TRPCReactProvider` e `useTRPC`
- [ ] Criar `src/app/api/trpc/[trpc]/route.ts` com o fetch adapter

### Routers

- [ ] Criar `src/trpc/routers/_app.ts` com o `appRouter` raiz
- [ ] Criar `src/trpc/routers/roast.ts`: procedures `submit` (mutation) e `getBySlug` (query)
  - `submit` substitui a Server Action `submitRoast` — chama a IA e persiste no banco
- [ ] Criar `src/trpc/routers/leaderboard.ts`: procedure `list` (query, com `limit` opcional)
- [ ] Criar `src/trpc/routers/stats.ts`: procedure `homepage` (query)

### Integração com as Pages

- [ ] Adicionar `TRPCReactProvider` ao `src/app/layout.tsx`
- [ ] Refatorar `src/app/page.tsx`: substituir queries diretas do Drizzle por `prefetch` + `HydrateClient`
- [ ] Refatorar `src/app/leaderboard/page.tsx`: idem
- [ ] Refatorar `src/app/roast/[id]/page.tsx`: usar `caller.roast.getBySlug` para dados server-only
- [ ] Refatorar `src/components/roast-form.tsx`: substituir `submitRoast` action por mutation tRPC (`trpc.roast.submit.mutationOptions()`)
- [ ] Converter componentes de leaderboard/stats para Client Components com `useSuspenseQuery`

### Limpeza

- [ ] Remover `src/app/actions/roast.ts` após a mutation tRPC estar funcional
- [ ] Remover imports diretos do Drizzle nas pages (mover para dentro dos routers tRPC)

---

## Status

Pronto para implementação.
