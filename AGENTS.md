# IsMyCodeTrash — Agent Guidelines

## Project

Next.js 16 app (App Router, `src/` dir, Turbopack) where users paste code and receive a brutal AI roast with a shame score and public leaderboard.

## Stack

| Tool | Purpose |
|---|---|
| Next.js 16 | Framework (App Router, Turbopack, Cache Components) |
| React 19 | UI |
| Tailwind CSS v4 | Styling |
| tailwind-variants (`tv`) | Class variants & merge |
| @base-ui/react | Headless interactive primitives |
| Vercel AI SDK + `@ai-sdk/anthropic` | Claude integration (`claude-sonnet-4-5`) |
| tRPC v11 | Type-safe API layer |
| TanStack React Query | Server state, caching, Suspense |
| Drizzle ORM | Database access (PostgreSQL) |
| Shiki | Server-side syntax highlighting |
| highlight.js | Client-side language auto-detection |
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

- **Server Components** — async Server Components with `"use cache"` + `cacheLife()` are the default. Use `caller` from `@/trpc/server` to call tRPC procedures directly.
- **Suspense boundaries** — wrap every async Server Component that fetches data in `<Suspense fallback={<Skeleton />}>` in the parent page.
- **Client Components** — only when interactivity or browser APIs are required. Use `useSuspenseQuery` with tRPC when data was prefetched; otherwise prefer async Server Components.
- **Never import `@/db` directly outside `src/db/queries/`** — all DB access goes through query functions.
- **Skeleton components** — every Suspense boundary needs a skeleton fallback; keep skeletons in `src/components/ui/` with `-skeleton` suffix.

## Animated Numbers

- Use `@number-flow/react` (`<NumberFlow>`) for any counter or metric that benefits from animated transitions
- Pattern for "0 → real value on mount": initialize state at `0`, set real value in `useEffect` after mount
- Always set `tabular-nums` on the surrounding element to prevent layout shift during animation

## Spec-First Development

- Write a spec in `specs/<feature>.md` before implementing any non-trivial feature
- Follow the format defined in `specs/AGENTS.md`

## Caching Rules

`cacheComponents: true` is enabled — all data access must be explicitly cached or wrapped in `<Suspense>`.

- Add `"use cache"` + `cacheLife("hours")` to query functions in `src/db/queries/` that back leaderboard/stats data
- Add `"use cache"` to async Server Components that aggregate those queries (e.g. `LeaderboardPageContent`)
- Pages that access `params` (dynamic routes) must include `"use cache"` in the page function
- Client Components with `useState`/hooks must be wrapped in `<Suspense>` in the layout or parent — never render them bare in a cached page

## AI Integration Rules

- All AI calls go through `src/lib/ai.ts` — never call the AI SDK directly from actions or components
- Use `generateObject` with a Zod schema for structured output — **do not use `.min()/.max()` on number fields or `.max()` on string/array fields** in the schema; Anthropic's API does not support these JSON Schema constraints. Move limits to `.describe()` instead.
- `temperature`: `1.0` for roast mode (creative/sarcastic), `0.5` for normal mode (direct)
- Model: `claude-sonnet-4-5` — do not change without updating the spec

## Server Actions Rules

- Server Actions live in `src/app/actions/` and handle form submissions that end in `redirect()`
- They are the only place where `analyzeCode()` from `src/lib/ai.ts` is called
- Loading state on submit buttons: use `useFormStatus` from `react-dom` in a dedicated `<SubmitButton>` Client Component

## File Conventions

| Path | Contents |
|---|---|
| `src/components/ui/` | Primitive UI components (one per file, kebab-case) |
| `src/components/` | Feature/page-level components (e.g. `HomepageStats`) |
| `src/trpc/` | tRPC init, routers, server proxy, client provider |
| `src/db/queries/` | One file per domain; functions must have `"use cache"` when used by cached pages |
| `src/lib/ai.ts` | AI integration — `analyzeCode()`, `roastResponseSchema`, prompt builder |
| `src/app/api/trpc/` | tRPC fetch adapter (no business logic) |
| `src/app/actions/` | Server Actions (form mutations that end in `redirect()`) |
| `specs/` | Feature specs written before implementation |

## Subdirectory AGENTS.md

- `src/components/ui/AGENTS.md` — UI component structure, `tv()`, Base UI, typography
- `src/components/AGENTS.md` — feature component conventions
- `src/trpc/AGENTS.md` — tRPC patterns, router structure, server vs client usage
- `src/db/AGENTS.md` — Drizzle query patterns, schema rules
- `specs/AGENTS.md` — spec format and rules
