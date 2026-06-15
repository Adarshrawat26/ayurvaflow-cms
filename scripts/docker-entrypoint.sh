#!/bin/sh
set -e

PORT="${PORT:-3001}"

echo "=== AyurvaFlow boot ==="
echo "PORT=${PORT}"
echo "NODE_ENV=${NODE_ENV:-}"
echo "DATABASE_URL=${DATABASE_URL:-<not set>}"
if [ -n "${JWT_SECRET}" ]; then
  echo "JWT_SECRET=set (${#JWT_SECRET} chars)"
else
  echo "JWT_SECRET=MISSING"
fi

# Fail fast with readable Railway logs (before migrate/seed)
if [ "${NODE_ENV}" = "production" ]; then
  if [ -z "${JWT_SECRET}" ] || [ "${#JWT_SECRET}" -lt 32 ]; then
    echo ""
    echo "FATAL: JWT_SECRET must be set in Railway (32+ random characters)."
    echo "       Generate: openssl rand -base64 48"
    echo "       Variables → Add JWT_SECRET → redeploy"
    exit 1
  fi
  if [ -z "${DATABASE_URL}" ]; then
    echo ""
    echo "FATAL: DATABASE_URL must be set in Railway."
    echo "       Use: file:./data/ayurvaflow.db"
    echo "       Mount a volume at /app/prisma/data"
    exit 1
  fi
fi

# Volume mounts may be root-owned — ensure app user can write SQLite
mkdir -p /app/prisma/data
chown -R ayurva:ayurva /app/prisma/data 2>/dev/null || true

echo "Running database migrations..."
if ! su-exec ayurva npx prisma migrate deploy; then
  echo "migrate deploy failed — falling back to db push..."
  su-exec ayurva npx prisma db push
fi

seed_if_empty() {
  if su-exec ayurva node --input-type=module -e "
    import { PrismaClient } from '@prisma/client';
    const p = new PrismaClient();
    const n = await p.user.count();
    await p.\$disconnect();
    process.exit(n > 0 ? 0 : 1);
  "; then
    echo "Database already has users — skip seed."
    return 0
  fi
  echo "First boot — seeding demo data..."
  ALLOW_SEED=1 NODE_ENV=production su-exec ayurva npx tsx prisma/seed.ts
  echo "Seed complete."
}

echo "Starting AyurvaFlow on 0.0.0.0:${PORT}..."
su-exec ayurva npm start &
SERVER_PID=$!

# Wait until HTTP is up so Railway healthcheck can pass before seed finishes
TRIES=0
while [ "$TRIES" -lt 60 ]; do
  if node -e "fetch('http://127.0.0.1:${PORT}/api/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "Server listening — healthcheck ready."
    break
  fi
  TRIES=$((TRIES + 1))
  sleep 1
done

if [ "$TRIES" -ge 60 ]; then
  echo "FATAL: Server did not start within 60s — check logs above."
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

# Seed after server is up (first boot can take a minute; healthcheck already passes)
(
  if ! seed_if_empty; then
    echo "WARN: Seed failed — app is running but may be empty. Retry with ALLOW_SEED=1."
  fi
) &

wait "$SERVER_PID"
