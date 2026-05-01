# AgentOS

![Screenshot placeholder](https://via.placeholder.com/1200x630/0A0A0F/6366F1?text=AgentOS+Command+Center)

**AgentOS** is a CEO-facing multi-agent orchestration platform: define department agents, attach knowledge bases (files, text, URLs), chain hand-offs, and run tasks through **BullMQ** pipelines with **Claude** streaming and **Socket.IO** live updates.

## Architecture (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router)  ·  TanStack Query  ·  Zustand      │
│  NextAuth (credentials)  →  JWT to Express API               │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST + Bearer JWT
┌───────────────────────────▼─────────────────────────────────┐
│  Express API  ·  Prisma  ·  PostgreSQL + pgvector           │
│  BullMQ worker  ·  Redis  ·  Socket.IO (task rooms)          │
│  Claude (messages.stream)  ·  Voyage embeddings (optional)     │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (or **pnpm** — enable via `corepack enable pnpm` and use `pnpm-workspace.yaml` + `workspace:*` deps if you prefer)
- **Docker** (for Postgres + Redis locally)

## Setup

```bash
git clone <repo> && cd agentOS
npm install
```

Copy environment files:

- `apps/api/.env.example` → `apps/api/.env`
- `apps/web/.env.example` → `apps/web/.env`

Fill in at least:

- `ANTHROPIC_API_KEY`, `JWT_SECRET` (32+ chars), `AUTH_SECRET` (32+ chars)
- `DATABASE_URL`, `REDIS_URL` matching Docker (defaults in `.env.example`; Postgres is exposed on host **`127.0.0.1:5433`** so it does not fight a local PostgreSQL on `:5432`)

Start infrastructure:

```bash
docker compose up -d
```

Database:

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

Run both apps:

```bash
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000  

**Demo login (after seed):** `demo@agentos.ai` / `Demo@1234`

## API summary

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Create user |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/auth/me` | Current user (Bearer) |
| GET | `/api/departments` | List + agent counts |
| GET | `/api/departments/:slug` | Department + agents |
| GET | `/api/agents` | `?departmentId=` optional |
| POST | `/api/agents` | Create agent |
| GET | `/api/agents/:id` | Detail + knowledge list + run history |
| PUT | `/api/agents/:id` | Update |
| DELETE | `/api/agents/:id` | Soft delete (`isActive=false`) |
| PUT | `/api/agents/:id/chain` | `{ nextAgentId }` |
| POST | `/api/agents/generate-prompt` | SSE `data: {"token"}` stream |
| POST | `/api/agents/:id/knowledge` | Multipart file **or** JSON text **or** JSON URL |
| GET | `/api/agents/:id/knowledge` | List docs |
| DELETE | `/api/knowledge/:docId` | Remove doc |
| GET | `/api/tasks` | `?status=` optional |
| POST | `/api/tasks` | Create + enqueue |
| GET | `/api/tasks/:id` | Task + steps |
| DELETE | `/api/tasks/:id` | Cancel job / mark failed |
| GET | `/api/stats/summary` | Dashboard counts |

### Socket events

- Client emits `task:join` / `task:leave` with `taskId`.
- Server emits: `task:token`, `task:step_complete`, `task:complete`, `task:error`.

## Embeddings

- Schema uses **`vector(1536)`**. [Voyage AI](https://www.voyageai.com/) `voyage-3-large` embeddings are **zero-padded** to 1536 when shorter.
- Without `VOYAGE_API_KEY`, the API falls back to deterministic pseudo-embeddings (fine for wiring, weak for semantic search).

## License

Private / internal use.
