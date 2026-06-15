#!/usr/bin/env node
/**
 * Read-only production smoke test — no login, no data mutations.
 * Usage: node scripts/smoke-prod.mjs [baseUrl]
 */
const BASE = (process.argv[2] ?? 'http://localhost:3001/api').replace(/\/$/, '')
const ORIGIN = BASE.replace(/\/api$/, '')
const results = []

function pass(feature, detail) { results.push({ feature, status: 'PASS', detail }) }
function fail(feature, detail) { results.push({ feature, status: 'FAIL', detail }) }

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  const text = await res.text()
  let body
  try { body = text ? JSON.parse(text) : {} } catch { body = { _raw: text.slice(0, 80) } }
  return { res, body }
}

async function main() {
  console.log(`\n🚀 Production smoke (read-only) → ${BASE}\n`)

  const health = await req('/health')
  if (health.res.ok && health.body.status === 'ok' && health.body.db === 'connected') {
    pass('Health + DB', 'ok')
  } else {
    fail('Health + DB', health.body.status ?? health.res.status)
  }

  if (isProdResponse(health.body)) pass('Health env hidden', 'no NODE_ENV leak')
  else warn('Health env hidden', 'NODE_ENV exposed — check server/index.ts')

  const unauth = await req('/bootstrap')
  unauth.res.status === 401 ? pass('Auth guard', 'bootstrap requires token') : fail('Auth guard', unauth.res.status)

  const badLogin = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'probe@test.com', password: 'wrong' }),
  })
  badLogin.res.status === 401 ? pass('Login rejects bad creds', '401') : fail('Login rejects bad creds', badLogin.res.status)

  const frontend = await fetch(`${ORIGIN}/`)
  frontend.ok ? pass('Frontend', `${frontend.status}`) : fail('Frontend', frontend.status)

  const favicon = await fetch(`${ORIGIN}/favicon.svg`)
  favicon.ok ? pass('Favicon', 'served') : fail('Favicon', favicon.status)

  printResults()
  process.exit(results.some(r => r.status === 'FAIL') ? 1 : 0)
}

function isProdResponse(body) {
  return body.env === undefined || body.env === 'production'
}

function warn(feature, detail) {
  results.push({ feature, status: 'WARN', detail })
}

function printResults() {
  console.log('─'.repeat(56))
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${r.feature.padEnd(28)} ${r.detail}`)
  }
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log('─'.repeat(56))
  console.log(`\n${passed} passed · ${failed} failed\n`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
