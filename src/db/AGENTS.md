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

```ts
// ✅ correto — query isolada em src/db/queries/stats.ts
export async function getHomepageStats() {
  const [result] = await db.select({ ... }).from(roasts);
  return result ?? defaultValue;
}

// ❌ errado — db importado diretamente em uma procedure ou Server Action
import { db } from "@/db";
const data = await db.select().from(roasts); // não fazer isso fora de queries/
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

## Relação com tRPC

As funções de `src/db/queries/` são consumidas **exclusivamente** pelas procedures em `src/trpc/routers/`. Essa separação garante que toda leitura de dados do cliente passe pela camada de API tipada.

```
Client Component
  → useSuspenseQuery(trpc.<router>.<proc>.queryOptions())
      → procedure em src/trpc/routers/<feature>.ts
          → função em src/db/queries/<feature>.ts
              → db (Drizzle)
```

A única exceção são Server Components que usam `caller` diretamente para dados que não precisam ser hidratados no cliente.
