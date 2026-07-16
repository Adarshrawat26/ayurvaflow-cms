/**
 * AgingBanner — Invoice accounts receivable aging summary
 * Inspired by OpenEMR AR aging report
 *
 * Shows three colored buckets at the top of the Billing page:
 * - 0–30 days (yellow)
 * - 30–60 days (orange)
 * - 60+ days (red)
 *
 * Clicking a bucket calls onFilter so the parent can filter the invoice list.
 */

import { motion } from 'framer-motion'
import { IndianRupee, TrendingDown } from 'lucide-react'
import type { Invoice } from '../../../types/entities'

interface Props {
  invoices: Invoice[]
  activeFilter: AgingBucket | null
  onFilter: (bucket: AgingBucket | null) => void
}

export type AgingBucket = '0-30' | '30-60' | '60+'

interface BucketDef {
  id: AgingBucket
  label: string
  days: [number, number]
  base: string
  active: string
  text: string
  border: string
}

const BUCKETS: BucketDef[] = [
  {
    id: '0-30',
    label: '0–30 days',
    days: [0, 30],
    base:   'bg-amber-50 border-amber-200',
    active: 'bg-amber-100 border-amber-400 ring-1 ring-amber-300',
    text:   'text-amber-800',
    border: 'border-amber-200',
  },
  {
    id: '30-60',
    label: '30–60 days',
    days: [30, 60],
    base:   'bg-orange-50 border-orange-200',
    active: 'bg-orange-100 border-orange-400 ring-1 ring-orange-300',
    text:   'text-orange-800',
    border: 'border-orange-200',
  },
  {
    id: '60+',
    label: '60+ days',
    days: [60, Infinity],
    base:   'bg-red-50 border-red-200',
    active: 'bg-red-100 border-red-400 ring-1 ring-red-300',
    text:   'text-red-800',
    border: 'border-red-200',
  },
]

function getAgeDays(invoice: Invoice): number {
  return (Date.now() - new Date(invoice.date).getTime()) / 86400000
}

function bucketMatch(age: number, bucket: BucketDef): boolean {
  return age >= bucket.days[0] && age < bucket.days[1]
}

export default function AgingBanner({ invoices, activeFilter, onFilter }: Props) {
  const unpaid = invoices.filter(i => i.status !== 'paid')

  const stats = BUCKETS.map(bucket => {
    const matched = unpaid.filter(inv => bucketMatch(getAgeDays(inv), bucket))
    const total = matched.reduce((sum, inv) => sum + (inv.total - inv.paid), 0)
    return { ...bucket, count: matched.length, total }
  })

  const hasAny = stats.some(s => s.count > 0)
  if (!hasAny) return null

  const grandTotal = unpaid.reduce((sum, inv) => sum + (inv.total - inv.paid), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <TrendingDown size={13} className="text-red-500" />
          <span className="text-xs font-semibold text-gray-700">Accounts Receivable Aging</span>
        </div>
        <div className="text-xs text-gray-500">
          Total outstanding:{' '}
          <span className="font-bold text-red-700">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(bucket => (
          <motion.button
            key={bucket.id}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilter(activeFilter === bucket.id ? null : bucket.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              activeFilter === bucket.id ? bucket.active : bucket.base
            }`}
          >
            <div className={`text-lg font-bold ${bucket.text}`}>
              {bucket.count}
            </div>
            <div className={`text-[11px] font-medium ${bucket.text}`}>{bucket.label}</div>
            <div className={`text-[10px] mt-0.5 ${bucket.text} opacity-70`}>
              {bucket.count > 0 ? (
                <>
                  <IndianRupee size={9} className="inline" />
                  {bucket.total.toLocaleString('en-IN')}
                </>
              ) : (
                'All clear ✓'
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {activeFilter && (
        <button
          onClick={() => onFilter(null)}
          className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 underline"
        >
          Clear filter — show all invoices
        </button>
      )}
    </motion.div>
  )
}

/**
 * Helper: filter invoices by aging bucket
 */
export function filterByAgingBucket(invoices: Invoice[], bucket: AgingBucket | null): Invoice[] {
  if (!bucket) return invoices
  const def = BUCKETS.find(b => b.id === bucket)!
  return invoices.filter(inv => {
    if (inv.status === 'paid') return false
    const age = getAgeDays(inv)
    return bucketMatch(age, def)
  })
}
