# NEXUS

NEXUS is a full-stack **AI Workspace Orchestration** platform: a command center where one natural-language instruction runs a multi-department pipeline (Product → Design → Engineering → QA ∥ Marketing → Sales) with **real** Claude streaming, **Socket.IO** live updates, and **SQLite** persistence.

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           React 18 (Vite) :3000          │
                    │  Zustand · Framer Motion · Recharts      │
                    └──────────────────┬──────────────────────┘
                                       │ HTTP /api · WS /socket.io
                    ┌──────────────────▼──────────────────────┐
                    │      Express + Socket.IO :3001           │
                    │  Orchestrator · Anthropic streaming      │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │   SQLite (better-sqlite3) ./data/      │
                    │   workflows · agent_runs · knowledge   │
                    └─────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

1. Clone or copy this repo and `cd nexus`.

2. Create `.env` in the **nexus** folder (see `.env.example`):

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   - Client: http://localhost:3000  
   - API + WebSocket: http://localhost:3001 (proxied from the client)

4. Production build:

   ```bash
   npm run build
   ```

## Project layout

- `client/` — React UI (Command Center, Workflow detail, History, Knowledge, Integrations, Settings)
- `server/` — Express API, orchestrator, agents, SQLite, Anthropic streaming
- `shared/` — Shared TypeScript types

## Features

- **Segment integrations**: On the Command Center, pick a methodology profile per stage (e.g. ChatPRD, Figma AI, QA Wolf, Jasper, 11x). NEXUS augments Claude’s system prompt to match each tool’s documented style. Profiles marked **· API** also run a **native sync** after that stage completes when credentials are set under **Settings → Native integrations** (Linear issue, Figma file comment, GitHub issues for Engineering/QA, HubSpot note/task for Marketing/Sales). Other profiles are prompt-only unless you use **Settings → Agent webhook** to POST completions to n8n, Make, or LangGraph. Catalog: `GET /api/integrations/providers`.
- **Sequential + parallel orchestration**: After Engineering, QA and Marketing run in parallel for `all` and `sales` scopes.
- **Streaming**: Claude `claude-sonnet-4-20250514` with token events over Socket.IO.
- **Manual approval**: Toggle in Settings pauses between agents; edit output, then approve.
- **Retry**: Failed agent can be retried from the workflow view (pipeline continues from that agent).
- **Knowledge base**: Agent outputs summarized into domain memory for later runs.

## Quality

- TypeScript strict mode on the client; server uses strict TS.
- Tailwind theme tokens match the NEXUS “Dark Command Center” palette (no hardcoded stray colors in components).
- Icons: `lucide-react` only.

## License

Private / use at your own risk for internal orchestration demos.
