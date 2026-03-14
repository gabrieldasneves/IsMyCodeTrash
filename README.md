# CodeRoaster

CodeRoaster is a web app that brutally judges your code. Paste any snippet, get an AI-powered roast with a shame score, and watch your worst code end up on a public leaderboard for everyone to see.

## Features

**Code Roasting** — Submit any code snippet and receive an unfiltered AI critique that points out every bad practice, antipattern, and questionable decision.

**Shame Score** — Each roast produces a score from 0 to 100 reflecting just how bad the code is. The higher the score, the deeper the shame.

**Leaderboard** — The worst submissions are immortalized in a public hall of shame, ranked by score. See how your disasters compare to others.

**Syntax Highlighting** — Code is displayed with full syntax highlighting, making it easier to appreciate exactly where things went wrong.

## Built with AI

This project was designed and built using AI tools throughout the entire development process:

- **Claude** (Anthropic) — used as the primary coding agent via Claude Code CLI to implement the application, components, and architecture decisions
- **Pencil** — AI-powered design tool used to create the UI mockups and extract the visual design system (colors, typography, spacing) directly into code

## Tech Stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS v4
- TypeScript

## Running locally

```bash
nvm use 20
npm install
npm run dev
```

Open `http://localhost:3000` to see the app.
