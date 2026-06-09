import type { Invoice, Patient } from '@/types/entities'

export function revenueByMonth(invoices: Invoice[], monthCount = 6) {
  const now = new Date()
  const months: { month: string; revenue: number; key: string }[] = []

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const month = d.toLocaleDateString('en-IN', { month: 'short' })
    const revenue = invoices
      .filter(inv => inv.date.startsWith(key))
      .reduce((sum, inv) => sum + inv.paid, 0)
    months.push({ month, revenue, key })
  }

  return months
}

const REFERRAL_PALETTE = [
  { stroke: '#3b82f6', color: 'bg-blue-500' },
  { stroke: '#10b981', color: 'bg-emerald-500' },
  { stroke: '#f59e0b', color: 'bg-amber-500' },
  { stroke: '#a855f7', color: 'bg-purple-500' },
  { stroke: '#6366f1', color: 'bg-indigo-500' },
  { stroke: '#ec4899', color: 'bg-pink-500' },
] as const

function roundedPercents(counts: number[], total: number): number[] {
  const raw = counts.map(c => (c / total) * 100)
  const floored = raw.map(p => Math.floor(p))
  let remainder = 100 - floored.reduce((a, b) => a + b, 0)
  const order = raw
    .map((p, i) => ({ i, frac: p - floored[i] }))
    .sort((a, b) => b.frac - a.frac)
  const pcts = [...floored]
  for (let j = 0; j < remainder; j++) {
    pcts[order[j % order.length].i]++
  }
  return pcts
}

export function referralBreakdown(patients: Patient[]) {
  if (!patients.length) return []
  const counts = new Map<string, number>()
  for (const p of patients) {
    const src = p.referral || 'Other'
    counts.set(src, (counts.get(src) ?? 0) + 1)
  }
  const total = patients.length
  const entries = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const pcts = roundedPercents(entries.map(([, c]) => c), total)

  return entries.map(([source], i) => {
    const palette = REFERRAL_PALETTE[i % REFERRAL_PALETTE.length]
    return {
      source,
      pct: pcts[i],
      color: palette.color,
      stroke: palette.stroke,
    }
  })
}

export function conditionBreakdown(patients: Patient[]) {
  const counts = new Map<string, number>()
  for (const p of patients) {
    const c = p.purpose || 'General Wellness'
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
}
