#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push

echo "Checking database..."
if ! node --input-type=module -e "
  import { PrismaClient } from '@prisma/client';
  const p = new PrismaClient();
  const n = await p.user.count();
  await p.\$disconnect();
  process.exit(n > 0 ? 0 : 1);
" 2>/dev/null; then
  echo "First boot — seeding clinic demo data..."
  ALLOW_SEED=1 NODE_ENV=production npx tsx prisma/seed.ts
fi

echo "Starting AyurvaFlow on port ${PORT:-3001}..."
exec npm start
