# tRPC — Padrões e Convenções

Camada de API do projeto. Usa tRPC v11 com `@trpc/tanstack-react-query` (nova integração, não a clássica `@trpc/react-query`).

## Estrutura de arquivos

```
src/trpc/
  init.ts         ← initTRPC, createTRPCContext, baseProcedure (server-only)
  query-client.ts ← makeQueryClient() compartilhado server/client
  server.tsx      ← trpc proxy, getQueryClient, HydrateClient, prefetch, caller (server-only)
  client.tsx      ← TRPCReactProvider, useTRPC ("use client")
  routers/
    _app.ts       ← appRouter raiz que combina todos os sub-routers
    <feature>.ts  ← um arquivo por domínio (stats, roast, leaderboard, etc.)
```

## Adicionando um novo router

1. Crie `src/trpc/routers/<feature>.ts` com `createTRPCRouter` e `baseProcedure`
2. Registre no `_app.ts`:
   ```ts
   export const appRouter = createTRPCRouter({
     stats: statsRouter,
     <feature>: <feature>Router, // ← adicionar aqui
   });
   ```
3. A tipagem (`AppRouter`) é inferida automaticamente — não precisa atualizar manualmente

## Procedures

- **Query** (`baseProcedure.query`) — leitura de dados, mapeado para `GET` internamente
- **Mutation** (`baseProcedure.mutation`) — escrita/efeitos colaterais, mapeado para `POST`
- Valide inputs com `zod` via `.input(z.object({...}))` antes do `.query()` / `.mutation()`
- Procedures chamam funções de `src/db/queries/` — **nunca acesse `db` diretamente em procedures**

```ts
// ✅ correto
export const roastRouter = createTRPCRouter({
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getRoastBySlug(input.slug)),
});

// ❌ errado — lógica de DB dentro da procedure
export const roastRouter = createTRPCRouter({
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => db.select().from(roasts).where(eq(roasts.slug, input.slug))),
});
```

## Uso em Server Components

Importe de `@/trpc/server` — nunca de `@/trpc/client`.

Com `cacheComponents: true` habilitado, o padrão atual é **`caller` + `"use cache"`** em async Server Components. O padrão `prefetch + HydrateClient` ainda existe na codebase mas não é o preferido para novos componentes.

```tsx
// ✅ Padrão preferido: caller + "use cache" em async Server Component
import { cacheLife } from "next/cache";
import { caller } from "@/trpc/server";

export async function HomepageStats() {
  "use cache";
  cacheLife("hours");

  const data = await caller.stats.homepage();
  return <StatsBar {...data} />;
}

// ✅ Para dados dinâmicos (sem cache), caller direto em página com "use cache"
export default async function RoastResultPage({ params }) {
  "use cache";
  const { id } = await params;
  const roast = await getRoastById(id); // keyed by id no cache
  if (!roast) notFound();
  return <RoastResult roast={roast} />;
}
```

**Quando usar `caller` vs `prefetch + HydrateClient`:**
| Cenário | Abordagem |
|---|---|
| Async Server Component com `"use cache"` | `caller` direto |
| Client Component precisa de dados e interatividade | `prefetch` + `HydrateClient` + `useSuspenseQuery` |
| Dados dinâmicos por request (params, cookies) | `caller` na page function com `"use cache"` |

## Uso em Client Components

Importe de `@/trpc/client` — nunca de `@/trpc/server`.

```tsx
"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.stats.homepage.queryOptions());
  // ...
}
```

- Prefira `useSuspenseQuery` quando o dado foi prefetchado no servidor (elimina estado `undefined`)
- Use `useQuery` apenas quando não houver prefetch e o componente precisa lidar com `isLoading`
- Mutations: `useMutation(trpc.<router>.<proc>.mutationOptions())`

## Regras

- `src/trpc/server.tsx` tem `import "server-only"` — nunca importar em Client Components
- `src/trpc/client.tsx` tem `"use client"` — nunca importar em Server Components
- O fetch adapter em `src/app/api/trpc/[trpc]/route.ts` é apenas o transport layer — sem lógica de negócio
- Não exponha o objeto `t` de `initTRPC` fora de `init.ts`
