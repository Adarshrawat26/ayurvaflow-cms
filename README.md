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
- API: http://localhost:3001

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ayurvaflow.com | Kairali123! |
| Receptionist | reception@ayurvaflow.com | Kairali123! |
| Doctor | doctor@ayurvaflow.com | Kairali123! |
| Therapist | therapist@ayurvaflow.com | Kairali123! |

## Production Deployment

### Option A: Docker

```bash
docker build -t ayurvaflow-cms .
docker run -p 3001:3001 \
  -e JWT_SECRET="your-long-random-secret" \
  -e NODE_ENV=production \
  ayurvaflow-cms
```

Open http://localhost:3001

### Option B: Manual

```bash
npm install
cp .env.example .env
# Edit JWT_SECRET in .env
npm run db:setup
npm run build
NODE_ENV=production npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/ayurvaflow.db` |
| `JWT_SECRET` | Auth signing secret | **Must change in production** |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | API server port | `3001` |
| `NODE_ENV` | `development` or `production` | `development` |

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
| `npm run db:setup` | Create and seed database |
| `npm run db:seed` | Re-seed database |
| `npm run lint` | Run ESLint |
| `npm run smoke` | API smoke test (start server first) |
| `npm run db:reset` | Reset DB and re-seed |

## One-Time Registration API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/patients/register` | New patient + full registration form |
| `POST` | `/api/patients/:id/registration` | Attach registration to existing patient |
| `GET` | `/api/patients/:id/registration` | Fetch signed registration |
| `PATCH` | `/api/patients/:id/registration` | Update office-use block (doctor/admin) |

Registration numbers are auto-assigned: `KACPL/{year}/{seq}/GRG`

## Security Notes

- Change `JWT_SECRET` before deploying to production
- Change default user passwords after first login
- Enable HTTPS via reverse proxy (nginx/Caddy) in production
- Database file (`data/ayurvaflow.db`) should be backed up regularly
