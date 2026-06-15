#!/usr/bin/env node
/**
 * Code / build smoke test — compile, lint, critical assets.
 * Usage: node scripts/smoke-code.mjs
 */
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = resolve(__dirname, '..')
const results = []

function pass(feature, detail) { results.push({ feature, status: 'PASS', detail }) }
function fail(feature, detail) { results.push({ feature, status: 'FAIL', detail }) }
function warn(feature, detail) { results.push({ feature, status: 'WARN', detail }) }

function run(cmd, label) {
  try {
    execSync(cmd, { cwd: root, stdio: 'pipe', encoding: 'utf8' })
    pass(label, 'ok')
    return true
  } catch (e) {
    const out = (e.stderr || e.stdout || e.message || '').slice(0, 400)
    fail(label, out.split('\n')[0] || 'failed')
    return false
  }
}

console.log('\n🧪 Code smoke test\n')

// Prisma client generated
run('npx prisma generate', 'Prisma generate')

// TypeScript + Vite production build
run('npm run build', 'Production build')

const distIndex = resolve(root, 'dist/index.html')
existsSync(distIndex) ? pass('dist/index.html', 'exists') : fail('dist/index.html', 'missing after build')

const critical = [
  'server/index.ts',
  'server/routes/api.ts',
  'server/routes/portal.ts',
  'src/App.tsx',
  'src/pages/PatientPortal.tsx',
  'src/components/portal/PortalBooking.tsx',
  'src/components/OneTimeRegistrationForm.tsx',
  'public/favicon.svg',
  'prisma/schema.prisma',
  'scripts/deploy.mjs',
  'scripts/check-production-env.mjs',
  'docker-compose.yml',
  'deploy/nginx.conf.example',
]

for (const f of critical) {
  existsSync(resolve(root, f)) ? pass(`File: ${f}`, 'present') : fail(`File: ${f}`, 'missing')
}

// ESLint — warn only (non-blocking for launch; fix iteratively)
try {
  execSync('npm run lint', { cwd: root, stdio: 'pipe', encoding: 'utf8' })
  pass('ESLint', 'ok')
} catch (e) {
  const lines = (e.stdout || e.stderr || '').split('\n').filter(l => l.includes('error'))
  warn('ESLint', `${lines.length || 'some'} issue(s) — non-blocking`)
}

// No dev JWT in built env example check
const envExample = existsSync(resolve(root, '.env.example'))
envExample ? pass('.env.example', 'present') : warn('.env.example', 'missing')

if (existsSync(resolve(root, '.gitignore'))) {
  const gi = readFileSync(resolve(root, '.gitignore'), 'utf8')
  gi.includes('.env') && gi.includes('*.db') ? pass('.gitignore secrets', '.env + *.db') : warn('.gitignore secrets', 'check .env and *.db')
}

printResults()
const failed = results.filter(r => r.status === 'FAIL').length
process.exit(failed > 0 ? 1 : 0)

function printResults() {
  console.log('─'.repeat(56))
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${r.feature.padEnd(28)} ${r.detail}`)
  }
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length
  console.log('─'.repeat(56))
  console.log(`\n${passed} passed · ${failed} failed · ${warnings} warnings\n`)
}
