# CodeRoaster

CodeRoaster is a web app that brutally judges your code. Paste any snippet, get an AI-powered roast with a shame score, and watch your worst code end up on a public leaderboard for everyone to see.

## Features

**Code Roasting** — Submit any code snippet and receive an unfiltered AI critique powered by Claude. Points out every bad practice, antipattern, and questionable decision — with optional maximum sarcasm mode.

**Roast Mode** — Toggle between honest critique and full sarcasm. Roast mode cranks up Claude's tone to brutal, deadpan contempt for your architectural decisions.

**Shame Score** — Each roast produces a score from 0.0 to 10.0 reflecting just how bad the code is. Lower scores mean deeper shame.

**Verdicts** — Five tiers of shame: `excellent`, `acceptable`, `mediocre`, `needs_help`, `needs_serious_help`.

**Detailed Analysis** — Up to 6 categorized issues (critical, warning, good, info) with titles and explanations.

**Suggested Fix** — When the AI finds a clear improvement, it produces a unified diff showing exactly what to change.

**Leaderboard** — The worst submissions are immortalized in a public hall of shame, ranked by score, cached hourly.

**Syntax Highlighting** — The code editor detects the language automatically (highlight.js) and renders with Shiki on the server.

**Animated Stats** — Live counters for total roasts and average score animate from zero on load using NumberFlow.

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS v4, tailwind-variants |
| AI | Vercel AI SDK + Anthropic Claude (`claude-sonnet-4-5`) |
| API | tRPC v11 + TanStack React Query |
| Database | PostgreSQL 16 via Drizzle ORM |
| Caching | `"use cache"` + `cacheLife("hours")` on data functions |
| Syntax highlight | Shiki v4 (server-side) + highlight.js (auto-detection) |
| Animation | NumberFlow |
| Primitives | @base-ui/react |
| Linting | Biome |

## Built with AI

This project was designed and built using AI tools throughout the entire development process:

- **Claude** (Anthropic) — used as the primary coding agent via Claude Code CLI to implement the application, components, and architecture decisions. Also powers the roast feature itself via `claude-sonnet-4-5`.
- **Pencil** — AI-powered design tool used to create the UI mockups and extract the visual design system (colors, typography, spacing) directly into code.

## Running locally

**Prerequisites:** Node.js ≥ 20, Docker

```bash
nvm use 20
npm install

# Start the database
docker compose up -d

# Apply migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed

npm run dev
```

Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY="sk-ant-..."
```

Open `http://localhost:3000`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |

## Database scripts

```bash
npm run db:generate   # generate migrations from schema changes
npm run db:migrate    # apply migrations
npm run db:push       # push schema directly (dev only)
npm run db:studio     # open Drizzle Studio
npm run db:seed       # seed with fake data
```

## Project structure

```
src/
  app/
    actions/        # Server Actions (roast submission)
    api/trpc/       # tRPC fetch adapter
    leaderboard/    # Leaderboard page
    roast/[id]/     # Roast result page
  components/       # Feature components (HomepageStats, RoastForm, etc.)
    ui/             # Primitive UI components (Button, Badge, CodeBlock, etc.)
  db/
    queries/        # Drizzle query functions (roast.ts, stats.ts, leaderboard.ts)
    schema.ts       # Tables, enums, inferred types
  lib/
    ai.ts           # analyzeCode() — Claude integration via AI SDK
    languages.ts    # Language list and hljs→Shiki mapping
  trpc/
    routers/        # tRPC procedures (stats, leaderboard)
    server.tsx      # caller, HydrateClient, prefetch (server-only)
    client.tsx      # TRPCReactProvider, useTRPC (client-only)
specs/              # Feature specs written before implementation
```
