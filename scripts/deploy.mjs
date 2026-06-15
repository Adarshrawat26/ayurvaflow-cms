#!/usr/bin/env node
/**
 * Full production deployment pipeline.
 *
 * Usage:
 *   node scripts/deploy.mjs              # check → migrate → build → verify
 *   node scripts/deploy.mjs --start      # above + start server + smoke:prod
 *   node scripts/deploy.mjs --skip-build # migrate + verify only
 */
import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const startAfter = process.argv.includes('--start')
const skipBuild = process.argv.includes('--skip-build')
const freshInstall = process.argv.includes('--fresh')

function step(title) {
  console.log(`\n${'─'.repeat(56)}\n▶ ${title}\n${'─'.repeat(56)}`)
}

function run(cmd, label) {
  console.log(`$ ${cmd}`)
  try {
    execSync(cmd, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'production' },
    })
    console.log(`✅ ${label}`)
  } catch {
    console.error(`❌ ${label} failed`)
    process.exit(1)
  }
}

async function main() {
  console.log('\n🌿 AyurvaFlow — production deployment\n')

  step('1/6  Environment pre-flight')
  run('node scripts/check-production-env.mjs', 'Environment check')

  step('2/6  Install dependencies')
  if (freshInstall && existsSync(resolve(root, 'package-lock.json'))) {
    run('npm ci', 'Dependencies installed (fresh)')
  } else if (existsSync(resolve(root, 'node_modules'))) {
    console.log('⏭  Using existing node_modules (pass --fresh for clean npm ci)')
  } else if (existsSync(resolve(root, 'package-lock.json'))) {
    run('npm ci', 'Dependencies installed')
  } else {
    run('npm install', 'Dependencies installed')
  }

  step('3/6  Database migrations')
  run('npx prisma migrate deploy', 'Migrations applied')

  if (!skipBuild) {
    step('4/6  Production build')
    run('npm run build', 'Frontend built')
  } else {
    console.log('\n⏭  Skipping build (--skip-build)')
  }

  step('5/6  Verify build + database')
  run('node scripts/check-production-env.mjs --require-dist', 'Build artifact check')
  run('npm run prod:verify', 'Smoke verification')

  step('6/6  Deployment summary')
  const port = process.env.PORT ?? '3001'
  console.log(`
✅ Deployment pipeline complete.

Next steps:
  • Start server:  NODE_ENV=production npm run start:prod
  • Open app:      http://localhost:${port}
  • Smoke test:    npm run smoke:prod
  • Backup DB:     npm run backup:db

Before go-live:
  • Change default staff passwords (Settings → team)
  • Put HTTPS in front (see deploy/nginx.conf.example)
  • Schedule regular backups of prisma/data/
`)

  if (!startAfter) return

  console.log('Starting production server…\n')
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    console.error('❌ Set JWT_SECRET before --start')
    process.exit(1)
  }

  const child = spawn('npm', ['run', 'start:prod'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  })

  await new Promise(r => setTimeout(r, 3000))

  try {
    execSync(`node scripts/smoke-prod.mjs http://localhost:${port}/api`, { cwd: root, stdio: 'inherit' })
    console.log(`\n🚀 Live at http://localhost:${port}\n`)
  } catch {
    console.error('\n⚠️  Server started but smoke:prod had failures — check logs.\n')
  }

  await new Promise(resolve => child.on('exit', resolve))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
