# NEXUS

This repository contains **AgentOS** (primary app) and an optional **legacy NEXUS** API stack (Express + SQLite).

## AgentOS (recommended)

Full-stack agent orchestration with Postgres, Redis, Prisma, Next.js, and the integrated **department floor** UI.

```bash
cd agentOS
docker compose up -d
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

- Web: http://localhost:3000  
- API: http://localhost:4000  

See `agentOS/README.md` for details.

---

## Legacy NEXUS server (optional)

The original **SQLite-backed orchestrator** (no Vite client — it was removed after the UI moved into AgentOS). Use this only if you still need the old workflow API on port **3001**.

### Architecture (legacy)

```
┌─────────────────────────────────────────┐
│  Consumer: AgentOS or your own client │
└──────────────────┬──────────────────────┘
                   │ HTTP /api · WS /socket.io
┌──────────────────▼──────────────────────┐
│      Express + Socket.IO :3001           │
│  Orchestrator · Anthropic streaming      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   SQLite (better-sqlite3) ./data/       │
└─────────────────────────────────────────┘
```

### Run legacy API only

From the **repo root** (`nexus/`):

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` (Anthropic key, `PORT=3001`, `NEXUS_DB_PATH`).

### Layout

- `agentOS/` — **main product** (Next.js + API + shared package)
- `server/` — legacy Express API, orchestrator, SQLite
- `shared/` — TypeScript types shared with `server/`

### License

Private / use at your own risk for internal orchestration demos.
