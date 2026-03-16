# Components — Padrões e Convenções

## Onde colocar cada componente

```
src/components/
  ui/             ← componentes primitivos, reutilizáveis, sem lógica de negócio
  <feature>.tsx   ← componentes de feature, ligados a uma página ou domínio específico
```

### `src/components/ui/`

Componentes de design system: Button, Badge, Input, CodeBlock, StatsBar, Skeleton, etc.

- Sem dependência de tRPC, Drizzle ou contexto de negócio
- Recebem dados exclusivamente via props
- Seguem os padrões detalhados em `src/components/ui/AGENTS.md`

### `src/components/` (raiz)

Componentes de feature que orquestram dados e lógica:

- Podem usar `useTRPC`, `useSuspenseQuery`, `useMutation`
- Compõem componentes de `ui/` com dados reais
- Um arquivo por feature/página (`homepage-stats.tsx`, `roast-form.tsx`)
- Geralmente são Client Components (`"use client"`) por consumirem hooks

**Exemplos:**
- `HomepageStats` — busca métricas via tRPC e renderiza `StatsBar`
- `RoastForm` — gerencia estado do editor e chama a Server Action de submit

## Padrão: Client Component com Suspense

Quando um componente de feature busca dados via tRPC:

1. O **Server Component pai** faz `prefetch` e envolve com `<HydrateClient>`
2. O **componente de feature** usa `useSuspenseQuery` — nunca `useQuery` quando há prefetch
3. O **Suspense boundary** fica no pai, com um skeleton de `ui/` como fallback
4. O **skeleton** corresponde visualmente ao componente real (mesmas dimensões/layout)

```tsx
// Server Component (page.tsx)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HomepageStats } from "@/components/homepage-stats";
import { StatsBarSkeleton } from "@/components/ui/stats-bar-skeleton";

export default function Page() {
  prefetch(trpc.stats.homepage.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<StatsBarSkeleton />}>
        <HomepageStats />
      </Suspense>
    </HydrateClient>
  );
}

// Feature component (homepage-stats.tsx)
"use client";
export function HomepageStats() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.stats.homepage.queryOptions());
  return <StatsBar {...data} />;
}
```

## Skeleton components

- Nome: `<ComponentName>Skeleton` / arquivo: `<name>-skeleton.tsx` em `ui/`
- Usam `animate-pulse` + `bg-[var(--color-border-primary)]` para o efeito de loading
- Mantêm as mesmas dimensões e layout do componente real para evitar layout shift
- São Server Components simples (sem `"use client"`, sem lógica)
