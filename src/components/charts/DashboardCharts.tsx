import { motion } from 'framer-motion'

const BAR_HEIGHT = 132

type RevenuePoint = { month: string; revenue: number }

export function RevenueBarChart({
  data,
  maxRevenue,
  fmt,
}: {
  data: RevenuePoint[]
  maxRevenue: number
  fmt: (n: number) => string
}) {
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map(t => Math.round(maxRevenue * t))

  return (
    <div className="flex gap-3">
      {/* Y-axis */}
      <div className="flex flex-col justify-between shrink-0 w-10 text-right" style={{ height: BAR_HEIGHT + 28, paddingTop: 4, paddingBottom: 24 }}>
        {yLabels.map((v, i) => (
          <span key={i} className="text-[9px] text-gray-300 leading-none">{fmt(v)}</span>
        ))}
      </div>

      {/* Chart area */}
      <div className="flex-1 min-w-0">
        <div className="relative" style={{ height: BAR_HEIGHT + 28 }}>
          {/* Grid lines */}
          <div className="absolute inset-x-0 top-1 flex flex-col justify-between pointer-events-none" style={{ height: BAR_HEIGHT }}>
            {yLabels.map((_, i) => (
              <div key={i} className="border-t border-dashed border-gray-100 w-full" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-x-0 top-1 flex items-end gap-2 sm:gap-3" style={{ height: BAR_HEIGHT }}>
            {data.map((r, i) => {
              const isLast = i === data.length - 1
              const barH = Math.max(10, Math.round((r.revenue / maxRevenue) * BAR_HEIGHT))
              const prev = i > 0 ? data[i - 1].revenue : r.revenue
              const delta = prev ? (((r.revenue - prev) / prev) * 100).toFixed(0) : '0'

              return (
                <div key={r.month} className="flex-1 flex flex-col items-center group/bar h-full justify-end">
                  <div
                    className={`mb-1.5 text-[10px] font-semibold transition-opacity ${
                      isLast ? 'text-[#1B4332] opacity-100' : 'text-gray-500 opacity-0 group-hover/bar:opacity-100'
                    }`}
                  >
                    {fmt(r.revenue)}
                    {i > 0 && (
                      <span className={`block text-[8px] font-medium ${Number(delta) >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {Number(delta) >= 0 ? '+' : ''}{delta}%
                      </span>
                    )}
                  </div>

                  <motion.div
                    className={`w-full max-w-[48px] mx-auto rounded-t-lg relative cursor-default ${
                      isLast
                        ? 'bg-gradient-to-t from-[#1B4332] to-[#52B788] shadow-md shadow-[#1B4332]/20'
                        : 'bg-gradient-to-t from-gray-300 to-gray-200 group-hover/bar:from-[#1B4332]/40 group-hover/bar:to-[#52B788]/60'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: barH }}
                    transition={{ delay: i * 0.08, duration: 0.55, ease: 'easeOut' }}
                    whileHover={{ scaleY: 1.02, scaleX: 1.06 }}
                    style={{ transformOrigin: 'bottom' }}
                  >
                    {isLast && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#52B788] ring-2 ring-white" />
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute inset-x-0 bottom-0 flex gap-2 sm:gap-3">
            {data.map((r, i) => {
              const isLast = i === data.length - 1
              return (
                <div key={r.month} className="flex-1 text-center">
                  <span className={`text-[10px] font-medium ${isLast ? 'text-[#1B4332] font-semibold' : 'text-gray-400'}`}>
                    {r.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

type ReferralItem = { source: string; pct: number; color: string; stroke: string }

const DONUT = { cx: 56, cy: 56, r: 40, stroke: 14, gap: 2 }

function donutArc(startPct: number, sweepPct: number) {
  const { cx, cy, r } = DONUT
  const gap = sweepPct >= 100 ? 0 : DONUT.gap
  const start = (startPct / 100) * 360 + gap / 2
  const end = ((startPct + sweepPct) / 100) * 360 - gap / 2
  if (end <= start) return ''

  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const s = toXY(start)
  const e = toXY(end)
  const large = end - start > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export function ReferralChart({ items }: { items: ReferralItem[] }) {
  const segments = items.reduce<{ item: ReferralItem; start: number }[]>((acc, item) => {
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].item.pct : 0
    acc.push({ item, start })
    return acc
  }, [])

  return (
    <div className="min-w-0 w-full overflow-hidden">
      {/* Donut — centred, clipped so stroke cannot spill outside the card */}
      <div className="flex justify-center mb-4">
        <div className="relative shrink-0 w-[100px] h-[100px] overflow-hidden">
          <svg
            width="100"
            height="100"
            viewBox="0 0 112 112"
            className="block max-w-full"
            aria-hidden
          >
            <circle
              cx={DONUT.cx}
              cy={DONUT.cy}
              r={DONUT.r}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={DONUT.stroke}
            />
            {segments.map(({ item, start }, i) => {
              const d = donutArc(start, item.pct)
              if (!d) return null
              return (
                <motion.path
                  key={item.source}
                  d={d}
                  fill="none"
                  stroke={item.stroke}
                  strokeWidth={DONUT.stroke}
                  strokeLinecap="butt"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.55, ease: 'easeOut' }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-bold text-gray-900 leading-none">{items.length}</span>
            <span className="text-[8px] text-gray-400 mt-0.5">{items.length === 1 ? 'source' : 'sources'}</span>
          </div>
        </div>
      </div>

      {/* Legend — full card width, no horizontal bleed */}
      <div className="min-w-0 w-full space-y-2">
        {items.map((item, i) => (
          <div key={item.source} className="min-w-0 w-full">
            <div className="flex items-center gap-1.5 text-[11px] leading-tight mb-1 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
              <span className="flex-1 min-w-0 truncate text-gray-700 font-medium">{item.source}</span>
              <span className="shrink-0 tabular-nums text-gray-900 font-semibold">{item.pct}%</span>
            </div>
            <div className="h-1.5 w-full max-w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full max-w-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CONDITION_COLORS = [
  'from-[#1B4332] to-[#52B788]',
  'from-emerald-600 to-emerald-400',
  'from-amber-600 to-amber-400',
  'from-blue-600 to-blue-400',
  'from-purple-600 to-purple-400',
  'from-gray-500 to-gray-400',
]

type ConditionItem = { name: string; count: number }

export function ConditionChart({ items, maxCount }: { items: ConditionItem[]; maxCount: number }) {
  const total = items.reduce((a, c) => a + c.count, 0)

  return (
    <div className="space-y-3">
      {items.map((c, i) => {
        const pct = Math.round((c.count / total) * 100)
        const barPct = (c.count / maxCount) * 100
        return (
          <div key={c.name} className="group">
            <div className="flex justify-between items-baseline text-xs mb-1.5">
              <span className="text-gray-700 font-medium truncate pr-2">{c.name}</span>
              <div className="shrink-0 text-right">
                <span className="font-bold text-gray-900">{c.count}</span>
                <span className="text-gray-400 ml-1">({pct}%)</span>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${CONDITION_COLORS[i % CONDITION_COLORS.length]}`}
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.65, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
