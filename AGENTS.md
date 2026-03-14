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
| Shiki | Server-side syntax highlighting |
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

## File Conventions

- UI components: `src/components/ui/` — one component per file, kebab-case filename, PascalCase export
- Pages: `src/app/` — App Router conventions
- Detailed UI component patterns: `src/components/ui/AGENTS.md`
