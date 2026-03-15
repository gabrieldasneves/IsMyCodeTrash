# CodeRoaster

CodeRoaster is a web app that brutally judges your code. Paste any snippet, get an AI-powered roast with a shame score, and watch your worst code end up on a public leaderboard for everyone to see.

## Features

**Code Roasting** — Submit any code snippet and receive an unfiltered AI critique that points out every bad practice, antipattern, and questionable decision.

**Shame Score** — Each roast produces a score from 0.0 to 10.0 reflecting just how bad the code is. Lower scores mean deeper shame.

**Leaderboard** — The worst submissions are immortalized in a public hall of shame, ranked by score. See how your disasters compare to others.

**Syntax Highlighting** — The code editor detects the language automatically and applies syntax highlighting using Shiki (the same engine as VS Code).

**Animated Stats** — Live counters for total roasts and average score animate from zero on load using NumberFlow.

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, tailwind-variants |
| API | tRPC v11 + TanStack React Query |
| Database | PostgreSQL 16 via Drizzle ORM |
| Syntax highlight | Shiki v4 (server-side) + highlight.js (auto-detection) |
| Animation | NumberFlow |
| Primitives | @base-ui/react |
| Linting | Biome |

## Built with AI

This project was designed and built using AI tools throughout the entire development process:

- **Claude** (Anthropic) — used as the primary coding agent via Claude Code CLI to implement the application, components, and architecture decisions
- **Pencil** — AI-powered design tool used to create the UI mockups and extract the visual design system (colors, typography, spacing) directly into code

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

Open `http://localhost:3000`.

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
  app/              # Next.js App Router pages and API routes
    api/trpc/       # tRPC fetch adapter
  components/       # React components
    ui/             # Primitive UI components
  db/               # Drizzle schema, migrations, and queries
  trpc/             # tRPC router, procedures, and client/server setup
  hooks/            # Shared React hooks
  lib/              # Utilities (language list, etc.)
specs/              # Feature specs written before implementation
```
