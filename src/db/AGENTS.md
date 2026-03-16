# Database — Padrões e Convenções

Acesso ao banco via Drizzle ORM + PostgreSQL. O cliente Drizzle é um singleton em `src/db/index.ts`.

## Estrutura de arquivos

```
src/db/
  index.ts        ← singleton do cliente Drizzle (importar `db` daqui)
  schema.ts       ← todos os enums, tabelas e relações
  migrations/     ← gerado pelo drizzle-kit (nunca editar manualmente)
  queries/
    <feature>.ts  ← funções de query por domínio (roast.ts, stats.ts, leaderboard.ts)
  seed.ts         ← dados de exemplo para desenvolvimento
```

## Queries

- Uma função por operação, em `src/db/queries/<feature>.ts`
- Funções são `async` e retornam tipos explícitos quando o retorno não é óbvio
- **Nunca acesse `db` fora de `src/db/queries/`** — nem em procedures tRPC, nem em Server Actions, nem em componentes
- **Adicione `"use cache"` + `cacheLife()` nas query functions** que alimentam dados cacheados (leaderboard, stats). O cache é keyed pelos argumentos da função automaticamente.

```ts
// ✅ correto — query isolada com cache
import { cacheLife } from "next/cache";

export async function getHomepageStats() {
  "use cache";
  cacheLife("hours");

  const [result] = await db.select({ ... }).from(roasts);
  return result ?? defaultValue;
}

// ❌ errado — db importado diretamente fora de queries/
import { db } from "@/db";
const data = await db.select().from(roasts);
```

## Schema

- Todos os enums, tabelas e relações ficam em `schema.ts`
- Nunca crie tabelas ou enums fora de `schema.ts`
- Após qualquer alteração de schema: `npm run db:generate` → `npm run db:migrate`
- Nunca edite arquivos em `migrations/` manualmente

## Migrações

```bash
npm run db:generate   # gera migration a partir de mudanças no schema.ts
npm run db:migrate    # aplica migrations pendentes no banco
npm run db:push       # aplica schema diretamente sem migration (só em dev, com cuidado)
npm run db:studio     # abre Drizzle Studio para inspecionar o banco
```

## Relação com tRPC e Server Components

As funções de `src/db/queries/` são chamadas pelas procedures tRPC **ou** diretamente via `caller` em async Server Components. O fluxo atual preferido:

```
async Server Component (com "use cache")
  → caller.<router>.<proc>()
      → procedure em src/trpc/routers/<feature>.ts
          → função em src/db/queries/<feature>.ts (com "use cache")
              → db (Drizzle)
```

Para Client Components que precisam de dados interativos:

```
Client Component
  → useSuspenseQuery(trpc.<router>.<proc>.queryOptions())
      → procedure em src/trpc/routers/<feature>.ts
          → função em src/db/queries/<feature>.ts
              → db (Drizzle)
```
