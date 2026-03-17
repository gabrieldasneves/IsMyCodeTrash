# Spec: Drizzle ORM + PostgreSQL com Docker Compose

## Contexto

O IsMyCodeTrash atualmente usa dados estáticos hardcoded (leaderboard fake, contadores fictícios). Esta spec define a implementação do Drizzle ORM com PostgreSQL para persistir:

- Submissões de código roasted
- Resultados da análise da IA (score, verdict, issues, diff)
- Leaderboard público (ranking dos piores códigos)

O banco sobe via Docker Compose para desenvolvimento local.

---

## Stack de Banco de Dados

| Ferramenta               | Versão      | Propósito                                          |
| ------------------------ | ----------- | -------------------------------------------------- |
| PostgreSQL               | 16 (Alpine) | Banco relacional                                   |
| Drizzle ORM              | `^0.44`     | ORM type-safe, schema-as-code                      |
| drizzle-kit              | `^0.30`     | CLI de migrations                                  |
| `postgres` (Postgres.js) | —           | Driver PostgreSQL (preferível ao `pg` com Drizzle) |
| AI SDK (Vercel)          | `^4`        | Cliente de IA agnóstico de provider                |
| Docker Compose           | v2          | Orquestração local do Postgres                     |

> **Submissões são anônimas.** Não existe conceito de usuário ou autenticação neste projeto. Qualquer pessoa pode submeter código e qualquer pessoa pode ver o leaderboard — sem login, sem conta.

---

## Enums

```typescript
// src/db/schema.ts

export const verdictEnum = pgEnum("verdict", [
  "excellent", // score >= 8.0  — código decente
  "acceptable", // score >= 6.0  — passa, mas dá pra melhorar
  "mediocre", // score >= 4.0  — problemático
  "needs_help", // score >= 2.5  — bem ruim
  "needs_serious_help", // score < 2.5 — catastrófico (exibido no design)
]);

export const severityEnum = pgEnum("severity", [
  "critical", // problema grave (cor: accent-red no design)
  "warning", // atenção necessária (cor: accent-amber)
  "good", // ponto positivo (cor: accent-green)
  "info", // observação neutra
]);

export const languageEnum = pgEnum("language", [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "go",
  "rust",
  "java",
  "kotlin",
  "swift",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "scala",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "sql",
  "bash",
  "dockerfile",
  "markdown",
  "graphql",
  "prisma",
  "vue",
  "svelte",
  "plaintext", // fallback quando a detecção não identifica
]);
```

> **Nota:** `languageEnum` espelha exatamente a lista curada do `languages.ts` definido na spec do editor com syntax highlight.

---

## Tabelas

### `roasts`

Tabela principal. Cada submissão de código gera um roast.

```typescript
export const roasts = pgTable("roasts", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Código submetido (anônimo — sem vínculo de usuário)
  code: text("code").notNull(),
  language: languageEnum("language").notNull().default("plaintext"),
  lineCount: integer("line_count").notNull(),

  // Resultado da IA
  score: real("score").notNull(), // 0.0 – 10.0
  verdict: verdictEnum("verdict").notNull(),
  roastQuote: text("roast_quote").notNull(), // frase de impacto da IA (Score Hero + OG image)
  suggestedFix: text("suggested_fix"), // diff/código sugerido pela IA (null se código for bom)

  // Compartilhamento / OG
  slug: varchar("slug", { length: 12 }).notNull().unique(), // ID curto para /roast/[slug]

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

**Observações de design:**

- Sem campo de usuário — submissões são completamente anônimas
- Sem campo `isPublic` — todo roast entra automaticamente no leaderboard público
- `score` é `real` (float 4 bytes) — precisão de 1 casa decimal suficiente (ex: `3.5`, `7.2`)
- `roastQuote` alimenta o `Screen 2 - Roast Results` (campo `roastTitle`) e o `Screen 4 - OG Image`
- `slug` é gerado na criação (nanoid de 12 chars) — usado na URL pública `/roast/abc123`
- `lineCount` é calculado no backend antes de salvar: `code.split("\n").length`

---

### `roast_issues`

Issues do detailed_analysis (seção `Analysis Section` no Screen 2). Cada roast tem 2–6 issues.

```typescript
export const roastIssues = pgTable("roast_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  roastId: uuid("roast_id")
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),

  severity: severityEnum("severity").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  order: smallint("order").notNull(), // posição exibida no grid de cards (0-based)
});
```

**Observações de design:**

- `severity` mapeia diretamente para as variantes do `AnalysisCard` (`critical | warning | good | info`)
- `order` define a ordem de exibição no `Issues Grid` (2 colunas × N linhas no Screen 2)
- Relação: 1 roast → N issues (cascade delete)

---

### `diff_lines`

Linhas do `suggested_fix` (seção `Diff Section` no Screen 2). Armazena o diff estruturado.

```typescript
export const diffLines = pgTable("diff_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  roastId: uuid("roast_id")
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),

  type: diffTypeEnum("type").notNull(), // "removed" | "added" | "context"
  code: text("code").notNull(),
  lineNum: smallint("line_num").notNull(), // posição na exibição do diff
});

export const diffTypeEnum = pgEnum("diff_type", [
  "removed", // linha removida (cor vermelha no DiffLine)
  "added", // linha adicionada (cor verde no DiffLine)
  "context", // linha de contexto (cor neutra)
]);
```

**Observações de design:**

- Mapeia para o componente `DiffLine` (`type: "removed" | "added" | "context"`)
- `lineNum` garante a ordem correta de exibição no `Diff Block`

---

## Relacionamentos (Drizzle Relations)

```typescript
export const roastsRelations = relations(roasts, ({ many }) => ({
  issues: many(roastIssues),
  diffLines: many(diffLines),
}));

export const roastIssuesRelations = relations(roastIssues, ({ one }) => ({
  roast: one(roasts, {
    fields: [roastIssues.roastId],
    references: [roasts.id],
  }),
}));

export const diffLinesRelations = relations(diffLines, ({ one }) => ({
  roast: one(roasts, { fields: [diffLines.roastId], references: [roasts.id] }),
}));
```

---

## Índices

```typescript
// Leaderboard: busca os piores scores (score ASC) — usado no Screen 3
export const roastsScoreIdx = index("roasts_score_idx").on(roasts.score);

// Busca por slug para a página de compartilhamento /roast/[slug]
export const roastsSlugIdx = uniqueIndex("roasts_slug_idx").on(roasts.slug);

// Issues de um roast em ordem
export const issuesRoastIdx = index("issues_roast_order_idx").on(
  roastIssues.roastId,
  roastIssues.order,
);

// Diff de um roast em ordem
export const diffRoastIdx = index("diff_roast_linenum_idx").on(
  diffLines.roastId,
  diffLines.lineNum,
);
```

---

## Estrutura de Arquivos

```
src/
  db/
    index.ts          ← instância única do cliente Drizzle (singleton)
    schema.ts         ← todos os enums, tabelas e relações
    migrations/       ← gerado pelo drizzle-kit (não editar manualmente)
drizzle.config.ts     ← configuração do drizzle-kit
docker-compose.yml    ← Postgres + pgAdmin (opcional)
.env.local            ← DATABASE_URL (não commitado)
.env.example          ← template de variáveis de ambiente
```

---

## docker-compose.yml

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ismycodetrash_postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ismycodetrash
      POSTGRES_PASSWORD: ismycodetrash
      POSTGRES_DB: ismycodetrash
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # pgAdmin opcional — remover se não precisar da UI
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ismycodetrash_pgadmin
    restart: unless-stopped
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@ismycodetrash.dev
      PGADMIN_DEFAULT_PASSWORD: admin
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Variáveis de Ambiente

**.env.example**

```bash
# PostgreSQL — gerado pelo docker-compose.yml acima
DATABASE_URL="postgresql://ismycodetrash:ismycodetrash@localhost:5432/ismycodetrash"
```

**.env.local** (criado localmente, não commitado)

```bash
DATABASE_URL="postgresql://ismycodetrash:ismycodetrash@localhost:5432/ismycodetrash"
```

Adicionar ao `.gitignore`:

```
.env.local
.env
```

---

## drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

---

## src/db/index.ts

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton para não criar múltiplas conexões em desenvolvimento (hot reload)
const globalForDb = globalThis as unknown as {
  _db: ReturnType<typeof drizzle> | undefined;
};

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 10, // pool size
  });
  return drizzle(client, { schema });
}

export const db = globalForDb._db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb._db = db;
}
```

---

## Integração com AI SDK

O roast é gerado por uma IA via [Vercel AI SDK](https://sdk.vercel.ai), que é agnóstico de provider. O provider concreto (OpenAI, Anthropic, Google, etc.) é injetado na configuração — trocar de provider não exige alterar a lógica da aplicação.

### Dependências

```bash
npm install ai
# + o adapter do provider escolhido, ex:
npm install @ai-sdk/openai   # ou @ai-sdk/anthropic, @ai-sdk/google, etc.
```

Variável de ambiente adicional no `.env.example`:

```bash
# Apenas uma das chaves abaixo, dependendo do provider escolhido
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""
```

### Contrato de Output da IA (`generateObject`)

O AI SDK permite extrair objetos estruturados via `generateObject` com um schema Zod. Este é o contrato que o backend espera receber da IA — é o que será persistido no banco:

```typescript
// src/lib/ai/roast-schema.ts
import { z } from "zod";

export const roastOutputSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Shame score from 0.0 (catastrophic) to 10.0 (perfect). One decimal place.",
    ),

  verdict: z
    .enum([
      "excellent",
      "acceptable",
      "mediocre",
      "needs_help",
      "needs_serious_help",
    ])
    .describe("Verdict label matching the score range."),

  roastQuote: z
    .string()
    .max(200)
    .describe(
      "One brutal, witty sentence summarizing the code quality. No markdown.",
    ),

  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good", "info"]),
        title: z.string().max(80),
        description: z.string().max(300),
      }),
    )
    .min(2)
    .max(6)
    .describe("Detailed analysis cards. Mix of problems and positives."),

  suggestedFix: z
    .array(
      z.object({
        type: z.enum(["removed", "added", "context"]),
        code: z.string(),
      }),
    )
    .nullable()
    .describe(
      "Unified diff lines for the suggested fix. Null if code is already good.",
    ),
});

export type RoastOutput = z.infer<typeof roastOutputSchema>;
```

**Mapeamento score → verdict (regras para o prompt):**

| Score  | Verdict              |
| ------ | -------------------- |
| >= 8.0 | `excellent`          |
| >= 6.0 | `acceptable`         |
| >= 4.0 | `mediocre`           |
| >= 2.5 | `needs_help`         |
| < 2.5  | `needs_serious_help` |

### Função de geração do roast

```typescript
// src/lib/ai/generate-roast.ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai"; // trocar pelo provider desejado
import { roastOutputSchema } from "./roast-schema";

export async function generateRoast(code: string, language: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"), // trocar model/provider aqui
    schema: roastOutputSchema,
    system: `You are a brutally honest senior developer who reviews code with sharp wit and zero mercy.
Your job is to roast the submitted code and produce a structured analysis.
- Score: 0.0 is catastrophic, 10.0 is perfect. Be harsh but fair.
- roastQuote: one punchy sentence, lowercase, no markdown.
- issues: point out real problems (critical/warning) AND genuine good parts (good/info).
- suggestedFix: produce a unified diff only if meaningful improvements exist.`,
    prompt: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
  });

  return object; // tipado como RoastOutput
}
```

> **Para trocar de provider:** substituir o import `@ai-sdk/openai` e a linha `model:` — nada mais muda. O schema, o prompt e a lógica de persistência são independentes do provider.

### Fluxo completo (Server Action)

```
usuário clica "roast my code"
        ↓
Server Action recebe { code, language }
        ↓
generateRoast(code, language) → RoastOutput   ← AI SDK (agnóstico)
        ↓
createRoast(input) → { slug }                 ← Drizzle + Postgres
        ↓
redirect(`/roast/${slug}`)
```

---

## Queries de Referência

### Leaderboard (Screen 3 — piores scores)

```typescript
// src/db/queries/leaderboard.ts
import { db } from "@/db";
import { roasts } from "@/db/schema";
import { asc } from "drizzle-orm";

// Todos os roasts são públicos — sem filtro de visibilidade
export async function getLeaderboard(limit = 50) {
  return db
    .select({
      id: roasts.id,
      slug: roasts.slug,
      score: roasts.score,
      verdict: roasts.verdict,
      language: roasts.language,
      lineCount: roasts.lineCount,
      roastQuote: roasts.roastQuote,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .orderBy(asc(roasts.score)) // score mais baixo = mais vergonhoso = topo do leaderboard
    .limit(limit);
}
```

### Buscar roast completo para a página de resultado (Screen 2)

```typescript
// src/db/queries/roast.ts
import { db } from "@/db";
import { roasts, roastIssues, diffLines } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getRoastBySlug(slug: string) {
  const roast = await db.query.roasts.findFirst({
    where: eq(roasts.slug, slug),
    with: {
      issues: { orderBy: asc(roastIssues.order) },
      diffLines: { orderBy: asc(diffLines.lineNum) },
    },
  });
  return roast ?? null;
}
```

### Salvar um novo roast (chamado pela Server Action ou Route Handler)

```typescript
// src/db/queries/roast.ts
import { db } from "@/db";
import { roasts, roastIssues, diffLines } from "@/db/schema";
import { nanoid } from "nanoid";
import type { RoastOutput } from "@/lib/ai/roast-schema";

// Input é o output tipado do AI SDK + os campos de contexto da submissão
interface CreateRoastInput extends RoastOutput {
  code: string;
  language: string; // linguagem detectada/selecionada no editor
}

export async function createRoast(input: CreateRoastInput) {
  const slug = nanoid(12);
  const lineCount = input.code.split("\n").length;

  return db.transaction(async (tx) => {
    const [roast] = await tx
      .insert(roasts)
      .values({
        slug,
        code: input.code,
        language: input.language as never, // cast para o enum
        lineCount,
        score: input.score,
        verdict: input.verdict as never,
        roastQuote: input.roastQuote,
        suggestedFix: null, // diff é salvo em diff_lines; este campo armazena o patch raw (opcional)
      })
      .returning();

    if (input.issues.length > 0) {
      await tx.insert(roastIssues).values(
        input.issues.map((issue, order) => ({
          roastId: roast.id,
          severity: issue.severity as never,
          title: issue.title,
          description: issue.description,
          order,
        })),
      );
    }

    if (input.suggestedFix && input.suggestedFix.length > 0) {
      await tx.insert(diffLines).values(
        input.suggestedFix.map((line, lineNum) => ({
          roastId: roast.id,
          type: line.type as never,
          code: line.code,
          lineNum,
        })),
      );
    }

    return roast;
  });
}
```

---

## Mapeamento Design → Schema

| Tela (Pencil)                | Elemento de UI                           | Campo no Schema                                       |
| ---------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Screen 1 — Code Input        | `2,847 codes roasted`                    | `SELECT COUNT(*) FROM roasts`                         |
| Screen 1 — Code Input        | `avg score: 4.2/10`                      | `SELECT AVG(score) FROM roasts`                       |
| Screen 2 — Roast Results     | Score Ring (`3.5`)                       | `roasts.score`                                        |
| Screen 2 — Roast Results     | Badge verdict (`needs_serious_help`)     | `roasts.verdict`                                      |
| Screen 2 — Roast Results     | Roast quote                              | `roasts.roastQuote`                                   |
| Screen 2 — Roast Results     | `lang: javascript · 7 lines`             | `roasts.language`, `roasts.lineCount`                 |
| Screen 2 — Roast Results     | Issue Cards (critical/warning/good/info) | `roast_issues.severity`, `.title`, `.description`     |
| Screen 2 — Roast Results     | Diff Block                               | `diff_lines.type`, `.code`                            |
| Screen 3 — Shame Leaderboard | Entries com rank, score, linguagem       | `roasts.*` ordenado por `score ASC`                   |
| Screen 4 — OG Image          | Score grande, verdict dot, quote         | `roasts.score`, `roasts.verdict`, `roasts.roastQuote` |

---

## To-dos de Implementação

### Infraestrutura

- [ ] Criar `docker-compose.yml` na raiz do projeto
- [ ] Criar `.env.example` com `DATABASE_URL` e placeholder da chave de IA escolhida
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Instalar dependências de banco: `npm install drizzle-orm postgres nanoid` e `npm install -D drizzle-kit`
- [ ] Instalar dependências de IA: `npm install ai zod` + adapter do provider (`@ai-sdk/openai` ou outro)
- [ ] Criar `drizzle.config.ts` na raiz

### Schema e Migrations

- [ ] Criar `src/db/schema.ts` com todos os enums e tabelas desta spec
- [ ] Criar `src/db/index.ts` com o singleton do cliente Drizzle
- [ ] Rodar `npx drizzle-kit generate` para gerar a migration inicial
- [ ] Rodar `npx drizzle-kit migrate` (ou `push` em dev) para aplicar no banco local
- [ ] Adicionar scripts no `package.json`:
  ```json
  "db:generate": "drizzle-kit generate",
  "db:migrate":  "drizzle-kit migrate",
  "db:push":     "drizzle-kit push",
  "db:studio":   "drizzle-kit studio"
  ```

### Queries

- [ ] Criar `src/db/queries/leaderboard.ts` com `getLeaderboard()`
- [ ] Criar `src/db/queries/roast.ts` com `getRoastBySlug()` e `createRoast()`
- [ ] Criar `src/db/queries/stats.ts` com `getTotalRoasts()` e `getAverageScore()` (para os counters da homepage)

### Integração com as Pages

- [ ] **Homepage (Screen 1):** substituir dados estáticos do leaderboard preview por `getLeaderboard(3)` — Server Component assíncrono
- [ ] **Homepage (Screen 1):** substituir `2,847 codes roasted` e `avg score: 4.2/10` por queries reais
- [ ] **Página de resultado `/roast/[slug]` (Screen 2):** criar rota dinâmica `src/app/roast/[slug]/page.tsx` usando `getRoastBySlug(slug)` — já existe o componente `ScoreRing`, `AnalysisCard`, `DiffLine`, `CodeBlock`
- [ ] **Leaderboard `/leaderboard` (Screen 3):** criar rota `src/app/leaderboard/page.tsx` usando `getLeaderboard(50)` e o componente `LeaderboardRow`
- [ ] **OG Image `/roast/[slug]/opengraph-image.tsx` (Screen 4):** usar `getRoastBySlug(slug)` para gerar o OG image dinâmico com Next.js ImageResponse

### Integração com AI SDK

- [ ] Criar `src/lib/ai/roast-schema.ts` com o schema Zod (`roastOutputSchema`) e o tipo `RoastOutput`
- [ ] Criar `src/lib/ai/generate-roast.ts` com a função `generateRoast(code, language)` usando `generateObject` do AI SDK
- [ ] Escolher e configurar o provider no `.env.local` (OpenAI, Anthropic, Google, etc.)
- [ ] Testar a geração isoladamente antes de integrar com o banco

### Server Action

- [ ] Criar `src/app/actions/roast.ts` — Server Action que:
  1. Valida o código submetido (não vazio, tamanho razoável — sugestão: max 10.000 chars)
  2. Chama `generateRoast(code, language)` → `RoastOutput` via AI SDK
  3. Chama `createRoast({ ...roastOutput, code, language })` para persistir no banco
  4. Redireciona para `/roast/${slug}` via `redirect()`
- [ ] Conectar o botão `roast my code` da homepage à Server Action (converter o componente em Client Component ou usar form action)

### Seed (opcional, mas útil para dev)

- [ ] Criar `src/db/seed.ts` com dados de exemplo para popular o leaderboard em dev
- [ ] Adicionar script `"db:seed": "npx tsx src/db/seed.ts"` ao `package.json`

---

## Decisões e Justificativas

**Por que Drizzle e não Prisma?**
Drizzle é schema-as-code em TypeScript puro, sem geração de código extra. Queries são SQL-like (mais previsível), o bundle é menor e a integração com Next.js App Router/Edge é mais direta. Para o escopo do IsMyCodeTrash, a simplicidade do Drizzle é preferível.

**Por que `postgres` (lib) e não `pg`?**
A lib `postgres` (Postgres.js) tem suporte nativo a pool de conexões, é mais ergonômica para uso com Drizzle e tem performance superior para queries paralelas. O Drizzle recomenda `postgres` para PostgreSQL.

**Por que `score` é `real` e não `numeric`?**
O score exibido no design tem 1 casa decimal (`3.5`, `7.2`). `real` (float 4 bytes) tem precisão de ~7 dígitos, mais que suficiente. `numeric` seria overhead para este caso.

**Por que sem campo `isPublic` ou tabela de usuários?**
O projeto é explicitamente anônimo e público. Qualquer código submetido vai direto pro leaderboard — é parte da proposta de valor ("hall of shame"). Adicionar controle de visibilidade ou autenticação seria complexidade sem benefício no escopo atual.

**Por que AI SDK (Vercel) e não chamar a API do provider diretamente?**
O AI SDK abstrai a camada de provider com uma interface unificada (`generateObject`, `streamText`, etc.). Trocar de OpenAI para Anthropic é uma linha de código. Além disso, `generateObject` com schema Zod garante que o output da IA já chega tipado e validado — sem parsing manual de JSON.

**Por que `generateObject` e não `streamText`?**
O resultado do roast é um objeto estruturado com múltiplos campos (score, verdict, issues, diff). `generateObject` é a ferramenta certa: garante que a IA produza exatamente o contrato definido no schema Zod, com retry automático em caso de output inválido. `streamText` seria útil se quiséssemos exibir o roast sendo gerado em tempo real (possível evolução futura).

**Por que `slug` e não expor o `id` UUID?**
UUIDs na URL são feios e longos. Um `slug` de 12 chars (nanoid) é URL-friendly, curto o suficiente para compartilhamento social e tem colisão desprezível para o volume esperado.

**Por que `diffLines` é tabela separada e não JSON?**
O componente `DiffLine` precisa iterar sobre linhas individualmente. Uma tabela separada mantém o schema relacional e facilita queries futuras (ex: contar linhas removidas vs adicionadas por roast).

---

## Status

Pesquisa concluída — pronto para implementação.
