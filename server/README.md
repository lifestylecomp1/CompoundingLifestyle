# Compounding Lifestyle Partner Portal – Backend

Express API for the partner portal. Handles authentication, partner isolation, and materials access.

## Setup

```bash
cd server
npm install
```

## Run

**Development (API + hot-reload Vite, from repo root):** `npm run dev:full` or `npm run dev` in `server/`.

**Production-style (API + static SPA on one port):** build the client from the repo root (`npm run build`), then from `server/` with `dist/` present, either set `NODE_ENV=production` and required env (e.g. `JWT_SECRET`) and run `npm start`, or for a local one-port test without `NODE_ENV=production`, set `SERVE_STATIC=true`. The server serves `../dist` and `/api` together when `dist` exists (see `resolveFrontendDistPath` in `config`).

**Run (API only, dev):**

```bash
npm run dev
```

Server runs at **http://localhost:3001** (or `PORT`).

## Demo Partners (seeded on first run)

| Email | Password |
|-------|----------|
| demo@provider.com | partner123 |
| rep@example.com | partner123 |

## API

| Endpoint | Auth | Description |
|---------|------|-------------|
| `POST /api/auth/login` | No | Login with email/password |
| `GET /api/partners/me` | Yes | Current partner info |
| `GET /api/materials/all` | Yes | All materials (filtered by partner access) |
| `GET /api/materials/file/:id` | Yes (`Authorization: Bearer`) | Material file (PDF, etc.); optional `?token=` only if `ALLOW_AUTH_QUERY_TOKEN=true` |
| `POST /api/auth/seed-partner` | Header `X-Seed-Partner-Secret` when `SEED_PARTNER_SECRET` is set; **disabled in production** if that env var is unset | Create partner (bootstrap / dev) |

## Partner Isolation

- Each partner authenticates with JWT
- `material_access` table can restrict which materials a partner sees (empty = full access)
- Partners never see other partners' emails or info

## Env

Create `.env` in `server/` (see `.env.example`):

- **Production:** `JWT_SECRET` is required (min 32 characters) or the process exits.
- **`SEED_PARTNER_SECRET`:** If set, `POST /api/auth/seed-partner` must send the same value in header `X-Seed-Partner-Secret`. In production, if unset, seeding is disabled.
- **`TRUST_PROXY`:** Set to `true` when behind a reverse proxy so login rate limits use the client IP.
