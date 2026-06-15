#!/usr/bin/env node
/**
 * Blocks destructive dev scripts when NODE_ENV=production.
 * Override only for intentional first-time Docker seed: ALLOW_SEED=1
 */
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== '1') {
  console.error('❌ This command is disabled in production.')
  console.error('   Use migrations for schema changes and import real clinic data.')
  console.error('   For Docker first-time setup only: ALLOW_SEED=1 npm run db:seed')
  process.exit(1)
}
