import type { Invoice, Patient } from '@/types/entities'

const PALETTE = [
  { stroke: '#3b82f6', color: 'bg-blue-500' },
  { stroke: '#10b981', color: 'bg-emerald-500' },
  { stroke: '#f59e0b', color: 'bg-amber-500' },
  { stroke: '#a855f7', color: 'bg-purple-500' },
  { stroke: '#6366f1', color: 'bg-indigo-500' },
  { stroke: '#ec4899', color: 'bg-pink-500' },
] as const

const freq = (items: string[]) => {
  const m = new Map<string, number>()
  for (const x of items) m.set(x, (m.get(x) ?? 0) + 1)
  return m
}

const topK = (m: Map<string, number>, k: number) =>
  [...m].sort((a, b) => b[1] - a[1]).slice(0, k)

const pctRound = (counts: number[], total: number) => {
  const raw = counts.map(c => (c / total) * 100)
  const floored = raw.map(Math.floor)
  let rem = 100 - floored.reduce((a, b) => a + b, 0)
  const order = raw.map((p, i) => ({ i, f: p - floored[i] })).sort((a, b) => b.f - a.f)
  const out = [...floored]
  for (let j = 0; rem--; j++) out[order[j % order.length].i]++
  return out
}

export function revenueByMonth(invoices: Invoice[], monthCount = 6) {
  const buckets = new Map<string, number>()
  for (const inv of invoices) {
    const k = inv.date.slice(0, 7)
    buckets.set(k, (buckets.get(k) ?? 0) + inv.paid)
  }
  const now = new Date()
  return Array.from({ length: monthCount }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { month: d.toLocaleDateString('en-IN', { month: 'short' }), revenue: buckets.get(key) ?? 0, key }
  })
}

export function referralBreakdown(patients: Patient[]) {
  if (!patients.length) return []
  const top = topK(freq(patients.map(p => p.referral || 'Other')), 5)
  const pcts = pctRound(top.map(([, c]) => c), patients.length)
  return top.map(([source], i) => ({ source, pct: pcts[i], ...PALETTE[i % PALETTE.length] }))
}

export function conditionBreakdown(patients: Patient[]) {
  return topK(freq(patients.map(p => p.purpose || 'General Wellness')), 6)
    .map(([name, count]) => ({ name, count }))
}
