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

- Preferência por **async Server Components** com `"use cache"` + `cacheLife()` usando `caller` direto
- Client Components (`"use client"`) apenas quando há interatividade, estado local ou APIs de browser
- Um arquivo por feature/página (`homepage-stats.tsx`, `roast-form.tsx`)

**Exemplos:**
- `HomepageStats` — async Server Component com `"use cache"`, chama `caller.stats.homepage()`, renderiza `StatsBar`
- `HomepageLeaderboard` — async Server Component com `"use cache"`, chama `caller.leaderboard.preview()`
- `LeaderboardPageContent` — async Server Component com `"use cache"`, chama `caller.leaderboard.page()`
- `RoastForm` — Client Component, gerencia estado do editor e submete a Server Action
- `RoastSubmitButton` — Client Component, usa `useFormStatus` para loading state

## Padrão: async Server Component com `"use cache"`

O padrão preferido para feature components que buscam dados:

```tsx
// Feature component (homepage-stats.tsx)
import { cacheLife } from "next/cache";
import { caller } from "@/trpc/server";
import { StatsBar } from "@/components/ui/stats-bar";

export async function HomepageStats() {
  "use cache";
  cacheLife("hours");

  const { totalRoasts, averageScore } = await caller.stats.homepage();
  return <StatsBar totalRoasts={totalRoasts} averageScore={averageScore} />;
}

// Page (page.tsx) — sem HydrateClient, sem prefetch
export default function Page() {
  return (
    <Suspense fallback={<StatsBarSkeleton />}>
      <HomepageStats />
    </Suspense>
  );
}
```

## Padrão: Client Component com interatividade

Quando o componente precisa de estado ou APIs de browser:

```tsx
// Submit button com loading state (roast-submit-button.tsx)
"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function RoastSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "$ roasting..." : "$ roast_my_code"}
    </Button>
  );
}
```

## Skeleton components

- Nome: `<ComponentName>Skeleton` / arquivo: `<name>-skeleton.tsx` em `ui/`
- Usam `animate-pulse` + `bg-[var(--color-border-primary)]` para o efeito de loading
- Mantêm as mesmas dimensões e layout do componente real para evitar layout shift
- São Server Components simples (sem `"use client"`, sem lógica)
