#!/usr/bin/env node
const BASE = process.argv[2] ?? 'http://localhost:3001/api'

async function req(path, opts = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { _parseError: true, preview: text.slice(0, 120) }
  }
  return { res, body }
}

async function main() {
  const health = await req('/health', { method: 'GET' })
  console.log('health:', health.res.status, health.res.headers.get('content-type'), health.body)

  const login = await req('/portal/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@email.com', password: '1234' }),
  })
  console.log('login:', login.res.status, login.res.headers.get('content-type'), {
    hasToken: Boolean(login.body?.token),
    hasUserName: Boolean(login.body?.user?.name),
    keys: login.body && !login.body._parseError ? Object.keys(login.body) : login.body,
  })
  if (!login.body?.token) process.exit(1)

  const me = await req('/portal/me', {}, login.body.token)
  console.log('me:', me.res.status, { hasPatient: Boolean(me.body?.patient?.name) })

  const docs = await req('/portal/documents', {}, login.body.token)
  console.log('docs:', docs.res.status, { count: Array.isArray(docs.body) ? docs.body.length : -1 })

  const appts = await req('/portal/appointments', {}, login.body.token)
  console.log('appts:', appts.res.status, { count: Array.isArray(appts.body) ? appts.body.length : -1 })

  const blocked = await req('/bootstrap', {}, login.body.token)
  console.log('bootstrap:', blocked.res.status, { expected: 403 })
}

main().catch(e => { console.error(e); process.exit(1) })
