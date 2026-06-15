#!/bin/sh
set -e

echo "=== AyurvaFlow boot ==="
echo "PORT=${PORT:-3001}"
echo "NODE_ENV=${NODE_ENV:-}"
echo "DATABASE_URL=${DATABASE_URL:-<not set>}"

# Volume mounts may be root-owned — ensure app user can write SQLite
mkdir -p /app/prisma/data
chown -R ayurva:ayurva /app/prisma/data 2>/dev/null || true

echo "Running database migrations..."
su-exec ayurva npx prisma migrate deploy || su-exec ayurva npx prisma db push

echo "Checking database..."
if ! su-exec ayurva node --input-type=module -e "
  import { PrismaClient } from '@prisma/client';
  const p = new PrismaClient();
  const n = await p.user.count();
  await p.\$disconnect();
  process.exit(n > 0 ? 0 : 1);
"; then
  echo "First boot — seeding clinic demo data..."
  ALLOW_SEED=1 NODE_ENV=production su-exec ayurva npx tsx prisma/seed.ts
fi

echo "Starting AyurvaFlow on 0.0.0.0:${PORT:-3001}..."
exec su-exec ayurva npm start
