#!/usr/bin/env node
/**
 * Backup SQLite database to backups/ with timestamp.
 * Usage: node scripts/backup-db.mjs
 */
import 'dotenv/config'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dataDir = resolve(root, 'prisma/data')
const backupDir = resolve(root, 'backups')

if (!existsSync(dataDir)) {
  console.error('❌ No database directory at prisma/data/')
  process.exit(1)
}

const dbFiles = readdirSync(dataDir).filter(f => f.endsWith('.db'))
if (!dbFiles.length) {
  console.error('❌ No .db files found in prisma/data/')
  process.exit(1)
}

mkdirSync(backupDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')

for (const file of dbFiles) {
  const src = resolve(dataDir, file)
  const dest = resolve(backupDir, `${file.replace('.db', '')}-${stamp}.db`)
  copyFileSync(src, dest)
  console.log(`✅ Backed up → backups/${dest.split('/').pop()}`)
}
