# Spec: Roast Submission — Criação de Roasts com IA

## Contexto

A feature principal da aplicação. O usuário cola um trecho de código no editor, escolhe se quer análise normal ou roast mode (mais sarcástico), e clica em "roast my code". A IA analisa o código e redireciona para uma página de resultado com score, verdict, issues e diff de sugestão.

Atualmente a Server Action `submitRoast` é um stub que cria um roast placeholder. A página `/roast/[id]` exibe dados estáticos hardcoded.

---

## Decisão

**AI SDK (Vercel) + OpenAI `gpt-4o-mini`** — `OPENAI_API_KEY` já existe no `.env.local`. O AI SDK oferece `generateObject` com Zod schema para resposta estruturada, eliminando parsing manual de JSON.

**Structured output (JSON mode)** — A resposta da IA é um objeto Zod tipado com todos os campos necessários. Sem parsing, sem fallback de texto.

**Fluxo síncrono com redirect** — `submitRoast` é uma Server Action que aguarda a resposta da IA, persiste no banco e redireciona para `/roast/[id]`. Sem streaming por enquanto — o usuário vê o formulário até o redirect.

---

## Especificação

### Dependências a instalar

```bash
npm install ai @ai-sdk/openai zod
```

> `zod` provavelmente já existe (está em uso no tRPC), mas a instalação é idempotente.

---

### `src/lib/ai.ts` — Prompt + Schema Zod

```typescript
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Schema da resposta da IA
export const roastResponseSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.enum([
    "excellent",
    "acceptable",
    "mediocre",
    "needs_help",
    "needs_serious_help",
  ]),
  roastQuote: z.string().max(200), // frase de impacto, sarcástica ou direta
  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good", "info"]),
        title: z.string().max(80),
        description: z.string().max(300),
      }),
    )
    .min(1)
    .max(6),
  suggestedFix: z.string().nullable(), // código melhorado (apenas o trecho corrigido)
  diffLines: z
    .array(
      z.object({
        type: z.enum(["removed", "added", "context"]),
        code: z.string(),
      }),
    )
    .nullable(), // diff unificado do fix
});

export type RoastResponse = z.infer<typeof roastResponseSchema>;

export async function analyzeCode(
  code: string,
  roastMode: boolean,
): Promise<RoastResponse> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: roastResponseSchema,
    prompt: buildPrompt(code, roastMode),
  });
  return object;
}
```

**Prompts:**

- **Normal mode**: análise técnica direta, score justo, issues com explicações claras
- **Roast mode**: mesma análise, mas tom sarcástico/brutal no `roastQuote` e nas `descriptions`

---

### Score → Verdict mapping

```
score >= 8.0  → "excellent"
score >= 6.0  → "acceptable"
score >= 4.0  → "mediocre"
score >= 2.5  → "needs_help"
score <  2.5  → "needs_serious_help"
```

A IA gera o score (0–10) e o verdict correspondente diretamente no objeto.

---

### `src/app/actions/roast.ts` — Server Action reescrita

Fluxo completo:

1. Valida `code` (tamanho mínimo/máximo)
2. Lê `roastMode` do FormData
3. Detecta linguagem via `highlight.js` auto-detection
4. Chama `analyzeCode(code, roastMode)`
5. Persiste com `createRoast()` (já existe em `src/db/queries/roast.ts`)
6. `redirect(\`/roast/${roast.id}\`)`

---

### `src/db/queries/roast.ts` — Query existente

Verificar se `createRoast` já recebe `diffLines` e `issues` na mesma transação. Se não, adicionar upsert das tabelas relacionadas.

---

### `/roast/[id]/page.tsx` — Integração com dados reais

Substituir `STATIC_ROAST` por query real:

1. `await params` para obter o `id`
2. Query `getRoastById(id)` que faz JOIN com `roastIssues` e `diffLines`
3. `notFound()` se o roast não existir
4. `generateMetadata` dinâmico com o `roastQuote` real

**Cache**: a página de resultado é imutável (um roast nunca muda) → `"use cache"` com `cacheLife("max")` ou sem expiração.

---

### Loading state durante o roast

O form faz um POST síncrono (Server Action). O botão fica desabilitado enquanto o submit está pendente — usando `useFormStatus` do React para mostrar estado de loading no botão.

---

## To-dos de Implementação

- [ ] Instalar `ai`, `@ai-sdk/openai`, `zod`
- [ ] Criar `src/lib/ai.ts` com `analyzeCode()` e `roastResponseSchema`
- [ ] Verificar/atualizar `src/db/queries/roast.ts` para suportar `diffLines`
- [ ] Reescrever `src/app/actions/roast.ts` com fluxo completo
- [ ] Adicionar loading state no botão do `RoastForm` via `useFormStatus`
- [ ] Reescrever `src/app/roast/[id]/page.tsx` com dados reais do banco
- [ ] Testar end-to-end com um trecho de código real

## Status

Pronto para implementação.
