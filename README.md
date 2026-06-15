# Kairali CMS (AyurvaFlow)

Production-ready Ayurveda clinic management system with React frontend, Express API, SQLite database, and JWT authentication.

## Features

- **Authentication** — Email/password login with JWT tokens and bcrypt hashing
- **Patient management** — Register, search, and view patient records
- **One-time registration** — Full Kairali 3-page form (demographics, legal consent, e-signatures, printable PDF, office-use block)
- **Appointments** — Calendar scheduling with status workflow
- **Consultations** — Clinical notes with Ayurvedic suggestion chips
- **Treatments** — Track therapy programmes and session progress
- **Billing** — Invoices with GST, payment tracking, balance sync
- **Staff settings** — Admin can manage team (role-based access)
- **Dashboard** — Revenue charts, referrals, KPIs

## Quick Start (Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

### 3. Initialize database

```bash
npm run db:setup
```

### 4. Start dev servers (frontend + API)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3010 (proxied via Vite as `/api`)

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ayurvaflow.com | Kairali123! |
| Receptionist | reception@ayurvaflow.com | Kairali123! |
| Doctor | doctor@ayurvaflow.com | Kairali123! |
| Therapist | therapist@ayurvaflow.com | Kairali123! |

## Production Deployment

### Full process (recommended)

Run the automated pipeline — checks env, installs deps, migrates DB, builds, and verifies:

```bash
cp .env.example .env
# Edit JWT_SECRET: openssl rand -base64 48

npm run deploy          # full pipeline
npm run deploy:start    # pipeline + start server + smoke test
```

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `npm run deploy:check` | Validate JWT_SECRET, .env, build artifacts |
| 2 | `npm run deploy` | Install → migrate → build → verify |
| 3 | `npm run start:prod` | Start production server on port 3001 |
| 4 | `npm run smoke:prod` | Read-only health/auth/static checks |
| 5 | `npm run backup:db` | Snapshot SQLite to `backups/` |

### Pre-flight checklist

1. Set `JWT_SECRET` to a random 32+ character string (`openssl rand -base64 48`)
2. Set `NODE_ENV=production` and `TRUST_PROXY=1` if behind nginx/Caddy
3. Run `npm run db:setup` once on a fresh database (dev) or migrate in prod
4. Change all default staff passwords after first login
5. Put HTTPS in front of the app (reverse proxy)
6. Back up `prisma/data/ayurvaflow.db` regularly (`npm run backup:db`)
7. CI runs automatically on push via `.github/workflows/ci.yml`

### Option A: Docker Compose (recommended)

```bash
cp .env.example .env
# Edit JWT_SECRET in .env (32+ chars)

docker compose up -d --build

# First-time only — seed demo clinic data (skip in real prod if you import your own data)
docker compose run --rm -e ALLOW_SEED=1 app npm run db:seed
```

Open http://localhost:3001

### Option B: Docker (standalone)

```bash
docker build -t ayurvaflow-cms .
docker run -p 3001:3001 \
  -e JWT_SECRET="your-long-random-secret-at-least-32-chars" \
  -e NODE_ENV=production \
  -e TRUST_PROXY=1 \
  -v ayurvaflow-data:/app/prisma/data \
  ayurvaflow-cms
```

Open http://localhost:3001

### Option D: Railway (client demo / staging)

1. Push this repo to GitHub.
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select `ayurvaflow-cms`.
3. **Variables** (service → Variables):

   | Variable | Value |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `openssl rand -base64 48` |
   | `DATABASE_URL` | `file:./data/ayurvaflow.db` |
   | `TRUST_PROXY` | `1` |

4. **Volume** (required): Service → **Volumes** → Add volume → mount path `/app/prisma/data`
5. **Networking** → **Generate domain** → copy the `*.up.railway.app` URL for your client.
6. First deploy auto-seeds demo data if the database is empty.

**Healthcheck failed?** In Railway → **Deployments** → **View logs**, look for `FATAL:` lines at boot. Almost always:

- `JWT_SECRET` missing or shorter than 32 characters
- `DATABASE_URL` not set to `file:./data/ayurvaflow.db`
- Volume not mounted at `/app/prisma/data`

Liveness probe: `GET /api/live` (instant). Full check: `GET /api/health` (includes DB).

**Client login (demo):** `admin@ayurvaflow.com` / `Kairali123!` — change passwords before real use.

### Option C: Manual

```bash
npm install
cp .env.example .env
# Edit JWT_SECRET in .env (32+ chars)
npm run db:setup
npm run build
npm run start:prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/ayurvaflow.db` |
| `JWT_SECRET` | Auth signing secret | **Must change in production (32+ chars)** |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | API server port | `3001` |
| `NODE_ENV` | `development` or `production` | `development` |
| `TRUST_PROXY` | Trust `X-Forwarded-*` from reverse proxy | `0` |

## Architecture

```
├── src/                  # React frontend (Vite + Redux)
├── server/               # Express API + JWT auth
├── prisma/               # Database schema + seed
├── database/schema.sql   # PostgreSQL reference schema
└── data/                 # SQLite database (auto-created)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + API concurrently |
| `npm run build` | Build frontend for production |
| `npm start` | Run production server (serves API + static) |
| `npm run start:prod` | Migrate DB + run production server |
| `npm run db:setup` | Create and seed database |
| `npm run db:seed` | Re-seed database |
| `npm run lint` | Run ESLint |
| `npm run smoke` | API smoke test (start server first) |
| `npm run smoke:prod` | Read-only production smoke (server on 3001) |
| `npm run prod:verify` | DB + build checks before deploy |
| `npm run deploy:check` | Validate production environment |
| `npm run deploy` | Full deploy pipeline (migrate + build + verify) |
| `npm run deploy:start` | Deploy pipeline + start server |
| `npm run backup:db` | Backup SQLite database to `backups/` |
| `npm run db:reset` | Reset DB and re-seed (dev only) |

## One-Time Registration API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/patients/register` | New patient + full registration form |
| `POST` | `/api/patients/:id/registration` | Attach registration to existing patient |
| `GET` | `/api/patients/:id/registration` | Fetch signed registration |
| `PATCH` | `/api/patients/:id/registration` | Update office-use block (doctor/admin) |

Registration numbers are auto-assigned: `KACPL/{year}/{seq}/GRG`

## Security Notes

- Server refuses to start in production with a weak or missing `JWT_SECRET`
- Login endpoints are rate-limited (20 attempts per 15 minutes per IP)
- Change default user passwords after first login
- Enable HTTPS via reverse proxy (nginx/Caddy) in production
- Database file (`prisma/data/ayurvaflow.db`) should be backed up regularly
- Patient payments in the portal are simulated — integrate Razorpay before accepting real payments
- `db:seed` and `db:reset` are blocked in production (use `ALLOW_SEED=1` for Docker first-time only)
- See `deploy/nginx.conf.example` for HTTPS reverse proxy setup
