#!/bin/sh
set -e

PORT="${PORT:-3001}"
export PORT
export NODE_ENV="${NODE_ENV:-production}"
export DATABASE_URL="${DATABASE_URL:-file:./data/ayurvaflow.db}"

echo "=== AyurvaFlow boot ==="
echo "PORT=${PORT}"
echo "NODE_ENV=${NODE_ENV}"
echo "DATABASE_URL=${DATABASE_URL}"
if [ -n "${JWT_SECRET}" ]; then
  echo "JWT_SECRET=set (${#JWT_SECRET} chars)"
else
  echo "JWT_SECRET=MISSING"
fi

if [ "${NODE_ENV}" = "production" ]; then
  if [ -z "${JWT_SECRET}" ] || [ "${#JWT_SECRET}" -lt 32 ]; then
    echo ""
    echo "FATAL: JWT_SECRET must be set (32+ random characters)."
    echo "       Generate: openssl rand -base64 48"
    echo "       Railway/Render → Variables → add JWT_SECRET → redeploy"
    exit 1
  fi
fi

mkdir -p /app/prisma/data

echo "Running database migrations..."
if ! npx prisma migrate deploy 2>&1; then
  echo "migrate deploy failed — falling back to db push..."
  npx prisma db push 2>&1 || echo "WARN: database setup failed — server will still start"
fi

seed_if_empty() {
  if node --input-type=module -e "
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
  ALLOW_SEED=1 NODE_ENV=production npx tsx prisma/seed.ts
  echo "Seed complete."
}

echo "Starting AyurvaFlow on 0.0.0.0:${PORT}..."
(
  sleep 3
  seed_if_empty || echo "WARN: Seed failed — app is running but may be empty."
) &

exec npm start
