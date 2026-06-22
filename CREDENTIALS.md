# Kairali CMS — Demo Credentials & Access

**App URL:** https://ayurvaflow-cms.onrender.com  
**Default password (all accounts):** `1234`

> Demo data only. Change all passwords before production use.

---

## Staff login

Open the app → **Staff** tab → sign in.

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@kairali.com` | `1234` |
| Receptionist | `reception@kairali.com` | `1234` |
| Doctor | `doctor@kairali.com` | `1234` |
| Therapist | `therapist@kairali.com` | `1234` |

### Additional staff (same password)

| Role | Email |
|------|--------|
| Doctor | `manjusha@kairali.com` |
| Doctor | `pratibha@kairali.com` |
| Therapist | `sujatha@kairali.com` |

---

## Patient portal login

Open the app → **Patient Portal** tab → sign in.

| Patient | Email | Password | Notes |
|---------|--------|----------|--------|
| Priya Sharma | `priya@email.com` | `1234` | Registered — book follow-ups online |
| Raj Mehta | `raj@email.com` | `1234` | Registered — outstanding balance |
| Anita Nair | `anita@email.com` | `1234` | New patient — One-Time Registration guide |

**Sample registration number:** `KACPL/2026/001/GRG` (Priya Sharma)

---

## Clinic (seed data)

| Field | Value |
|-------|--------|
| Name | Kairali Ayurvedic Centre |
| Email | `gurgaon@kairalicentres.com` |
| Location | Gurgaon |

---

## Hosting (Render — server config, not app login)

Set in Render → **Environment Variables**:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./data/ayurvaflow.db` |
| `TRUST_PROXY` | `1` |
| `JWT_SECRET` | 32+ character random string (set in Render dashboard) |

**Disk mount (Starter plan):** `/app/prisma/data`  
**Health check path:** `/api/live`

---

## Quick health checks

| URL | Expected |
|-----|----------|
| `/api/live` | `{"status":"ok"}` |
| `/api/health` | `"ready":true,"users":7` |

---

*Generated for client demo — June 2026*
