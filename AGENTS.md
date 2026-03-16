# CodeRoaster — Agent Guidelines

## Project

Next.js 16 app (App Router, `src/` dir, Turbopack) where users paste code and receive a brutal AI roast with a shame score and public leaderboard.

## Stack

| Tool | Purpose |
|---|---|
| Next.js 16 | Framework (App Router) |
| React 19 | UI |
| Tailwind CSS v4 | Styling |
| tailwind-variants (`tv`) | Class variants & merge |
| @base-ui/react | Headless interactive primitives |
| tRPC v11 | Type-safe API layer |
| TanStack React Query | Server state, caching, Suspense |
| Drizzle ORM | Database access (PostgreSQL) |
| Shiki | Server-side syntax highlighting |
| NumberFlow | Animated number transitions |
| Biome | Lint + format |
| TypeScript 5 | Types |

## Key Rules

- **Node 20** — always `nvm use 20`
- **Named exports only** — never `export default`
- **No `tailwind-merge` directly** — pass `className` into `tv()` for merge
- **No string interpolation in `className`** — use `tv()` variants instead
- **Hover on disabled buttons** — use `not-disabled:hover:` modifier, never plain `hover:`
- **Fonts** — `font-mono` (JetBrains Mono) for UI/labels/buttons; `font-sans` (system) for editorial text. Never `font-primary` / `font-secondary`
- **Interactive components** — use `@base-ui/react` primitives (Switch, Dialog, Menu, etc.)
- **Syntax highlighting** — always server-side via Shiki (`async` Server Component, no `"use client"`)
- **Lint/format** — run `npm run check` before committing

## Data Fetching Rules

- **Server Components** — prefer `async` Server Components for data fetching; use `prefetch` + `HydrateClient` from `@/trpc/server` to prefetch tRPC queries and stream data to Client Components via Suspense
- **Client Components** — use `useSuspenseQuery` (not `useQuery`) when data was prefetched on the server; wrap with `<Suspense fallback={<Skeleton />}>` in the parent
- **Direct DB access in pages** — only allowed when data is not needed by Client Components (i.e., no hydration required). Otherwise, route through tRPC
- **Never import `@/db` directly in Client Components** — all DB access must go through tRPC procedures or Server Components
- **Skeleton components** — every Client Component that uses `useSuspenseQuery` must have a corresponding skeleton for the Suspense fallback; keep skeletons in `src/components/ui/` with `-skeleton` suffix

## Animated Numbers

- Use `@number-flow/react` (`<NumberFlow>`) for any counter or metric that benefits from animated transitions
- Pattern for "0 → real value on mount": initialize state at `0`, set real value in `useEffect` after mount
- Always set `tabular-nums` on the surrounding element to prevent layout shift during animation

## Spec-First Development

- Write a spec in `specs/<feature>.md` before implementing any non-trivial feature
- Follow the format defined in `specs/AGENTS.md`

## File Conventions

| Path | Contents |
|---|---|
| `src/components/ui/` | Primitive UI components (one per file, kebab-case) |
| `src/components/` | Feature/page-level components (e.g. `HomepageStats`) |
| `src/trpc/` | tRPC init, routers, server proxy, client provider |
| `src/db/` | Drizzle schema, queries, migrations |
| `src/app/api/trpc/` | tRPC fetch adapter (do not add business logic here) |
| `src/app/actions/` | Server Actions (mutations with redirect only) |
| `specs/` | Feature specs written before implementation |

## Subdirectory AGENTS.md

- `src/components/ui/AGENTS.md` — UI component structure, `tv()`, Base UI, typography
- `src/components/AGENTS.md` — feature component conventions
- `src/trpc/AGENTS.md` — tRPC patterns, router structure, server vs client usage
- `src/db/AGENTS.md` — Drizzle query patterns, schema rules
- `specs/AGENTS.md` — spec format and rules
