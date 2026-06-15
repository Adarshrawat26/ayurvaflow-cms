#!/usr/bin/env node
/**
 * Pre-flight checks before production deploy.
 * Usage: node scripts/check-production-env.mjs [--require-dist]
 */
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const requireDist = process.argv.includes('--require-dist')

const WEAK = new Set([
  'dev-secret',
  'change-this-to-a-long-random-secret-in-production',
])

let failed = 0

function pass(msg) { console.log(`  ✅ ${msg}`) }
function fail(msg) { console.log(`  ❌ ${msg}`); failed += 1 }
function warn(msg) { console.log(`  ⚠️  ${msg}`) }

console.log('\n🔍 Production environment check\n')

if (!existsSync(resolve(root, '.env')) && !process.env.JWT_SECRET) {
  fail('Missing .env — copy .env.example and set JWT_SECRET')
} else {
  pass('.env or env vars present')
}

// Load .env for local checks (dotenv not required — manual parse)
const envPath = resolve(root, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const secret = process.env.JWT_SECRET
if (!secret) {
  fail('JWT_SECRET is not set')
} else if (secret.length < 32 || WEAK.has(secret)) {
  fail('JWT_SECRET must be 32+ random characters (openssl rand -base64 48)')
} else {
  pass(`JWT_SECRET looks strong (${secret.length} chars)`)
}

if (!process.env.DATABASE_URL) {
  warn('DATABASE_URL not set — will default to prisma/data/ayurvaflow.db via schema')
} else {
  pass('DATABASE_URL configured')
}

if (requireDist && !existsSync(resolve(root, 'dist/index.html'))) {
  fail('dist/index.html missing — run npm run build first')
} else if (existsSync(resolve(root, 'dist/index.html'))) {
  pass('Production build present (dist/)')
}

if (!existsSync(resolve(root, 'prisma/schema.prisma'))) {
  fail('prisma/schema.prisma missing')
} else {
  pass('Prisma schema present')
}

const dataDir = resolve(root, 'prisma/data')
if (!existsSync(dataDir)) {
  warn('prisma/data/ does not exist yet — will be created on first migrate')
} else {
  pass('Database directory exists')
}

console.log('')
if (failed > 0) {
  console.log(`❌ ${failed} check(s) failed — fix before deploying.\n`)
  process.exit(1)
}
console.log('✅ Environment ready for production deploy.\n')
