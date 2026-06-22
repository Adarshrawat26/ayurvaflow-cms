import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from './prisma.js'
import { isProduction } from './env.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function run(cmd: string) {
  console.log(`[db] $ ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env })
}

async function tableReady(): Promise<boolean> {
  try {
    await prisma.user.count()
    return true
  } catch {
    return false
  }
}

/** Ensure schema + demo data exist (fixes empty Render/Railway volumes). */
export async function bootstrapDatabase(): Promise<void> {
  if (!(await tableReady())) {
    console.log('[db] Schema missing — running migrations...')
    try {
      run('npx prisma migrate deploy')
    } catch {
      console.log('[db] migrate deploy failed')
    }
    if (!(await tableReady())) {
      // Fresh DB: only incremental migrations exist — push full schema from prisma/schema.prisma
      console.log('[db] Base tables missing — running prisma db push...')
      run('npx prisma db push')
    }
  }

  let users: number
  try {
    users = await prisma.user.count()
  } catch (err) {
    console.error('[db] Could not read users table:', err)
    throw err
  }

  if (process.env.FORCE_SEED === '1') {
    console.log('[db] FORCE_SEED=1 — reseeding demo data...')
    run('ALLOW_SEED=1 NODE_ENV=production npx tsx prisma/seed.ts')
    users = await prisma.user.count()
  } else if (users === 0 && isProduction()) {
    console.log('[db] Empty database — seeding demo data...')
    run('ALLOW_SEED=1 NODE_ENV=production npx tsx prisma/seed.ts')
    users = await prisma.user.count()
  }

  console.log(`[db] Ready — ${users} staff user(s)`)
}
