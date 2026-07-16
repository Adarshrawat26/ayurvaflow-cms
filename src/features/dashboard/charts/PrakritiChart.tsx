/**
 * PrakritiChart — Patient constitution distribution
 * Inspired by OpenMRS patient demographic reporting module
 *
 * Shows a compact horizontal bar breakdown of all registered patients
 * by their Prakriti (Ayurvedic body constitution type).
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '../../../store/hooks'
import { selectPatients } from '../../../store/selectors'

const PRAKRITI_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  'Vata':          { bar: 'bg-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  'Pitta':         { bar: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
  'Kapha':         { bar: 'bg-emerald-400',bg: 'bg-emerald-50',text: 'text-emerald-700' },
  'Vata-Pitta':    { bar: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
  'Pitta-Kapha':   { bar: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  'Vata-Kapha':    { bar: 'bg-teal-400',   bg: 'bg-teal-50',   text: 'text-teal-700' },
  'Tridosha':      { bar: 'bg-[#1B4332]',  bg: 'bg-[#1B4332]/10', text: 'text-[#1B4332]' },
}

export default function PrakritiChart() {
  const patients = useAppSelector(selectPatients)

  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of patients) {
      const key = p.prakriti?.trim() || 'Unknown'
      counts[key] = (counts[key] ?? 0) + 1
    }
    const total = patients.length || 1
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([prakriti, count]) => ({
        prakriti,
        count,
        pct: Math.round((count / total) * 100),
        colors: PRAKRITI_COLORS[prakriti] ?? { bar: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-700' },
      }))
  }, [patients])

  if (patients.length === 0) return null

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((item, i) => (
        <motion.div
          key={item.prakriti}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.colors.bg} ${item.colors.text}`}>
              {item.prakriti}
            </span>
            <span className="text-[11px] font-bold text-gray-700">
              {item.count} <span className="font-normal text-gray-400">({item.pct}%)</span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
