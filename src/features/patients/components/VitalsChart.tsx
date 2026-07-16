/**
 * VitalsChart — Sparkline chart of patient vitals across consultations.
 * Shows BP systolic, pulse rate, weight over visits.
 * Inspired by OHC Care vital signs graph.
 *
 * Pure frontend — reads from ConsultationRecord array.
 * No external charting lib — uses SVG path generation.
 */
import { useMemo } from 'react'
import type { ConsultationRecord } from '@/types/entities'

interface Point { label: string; value: number }

function Sparkline({
  points,
  color,
  height = 40,
}: {
  points: Point[]
  color: string
  height?: number
}) {
  if (points.length < 2) return null
  const width = 200
  const vals = points.map(p => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - ((p.value - min) / range) * (height - 6) - 3,
  }))

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${path} L${width},${height} L0,${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Area fill */}
      <path d={area} fill={color} fillOpacity={0.08} />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={2.5} fill={color} />
      ))}
    </svg>
  )
}

interface VitalsChartProps {
  consultations: ConsultationRecord[]
}

export default function VitalsChart({ consultations }: VitalsChartProps) {
  const series = useMemo(() => {
    // Sort by createdAt ascending
    const sorted = [...consultations]
      .filter(c => c.bp_systolic || c.pulse_rate || c.weight_kg)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-8)  // last 8 visits max

    if (sorted.length < 2) return null

    const label = (c: ConsultationRecord) => c.createdAt.slice(0, 10)

    return {
      bp: sorted
        .filter(c => c.bp_systolic && !isNaN(Number(c.bp_systolic)))
        .map(c => ({ label: label(c), value: Number(c.bp_systolic) })),
      pulse: sorted
        .filter(c => c.pulse_rate && !isNaN(Number(c.pulse_rate)))
        .map(c => ({ label: label(c), value: Number(c.pulse_rate) })),
      weight: sorted
        .filter(c => c.weight_kg && !isNaN(Number(c.weight_kg)))
        .map(c => ({ label: label(c), value: Number(c.weight_kg) })),
    }
  }, [consultations])

  if (!series || (series.bp.length < 2 && series.pulse.length < 2 && series.weight.length < 2)) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Not enough vitals data yet (need 2+ consultations with numeric vitals)
      </div>
    )
  }

  const tracks = [
    { key: 'bp',     label: 'BP Systolic (mmHg)', points: series.bp,     color: '#ef4444' },
    { key: 'pulse',  label: 'Pulse Rate (bpm)',    points: series.pulse,  color: '#3b82f6' },
    { key: 'weight', label: 'Weight (kg)',          points: series.weight, color: '#1B4332' },
  ].filter(t => t.points.length >= 2)

  return (
    <div className="space-y-4">
      {tracks.map(track => {
        const latest = track.points.at(-1)
        const prev   = track.points.at(-2)
        const delta  = latest && prev ? latest.value - prev.value : 0
        const arrow  = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
        const deltaColor = track.key === 'bp' || track.key === 'weight'
          ? (delta > 0 ? 'text-red-500' : delta < 0 ? 'text-green-600' : 'text-gray-400')
          : (delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-400')

        return (
          <div key={track.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">{track.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">{latest?.value ?? '–'}</span>
                {delta !== 0 && (
                  <span className={`text-[11px] font-medium ${deltaColor}`}>
                    {arrow}{Math.abs(delta).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <Sparkline points={track.points} color={track.color} />
          </div>
        )
      })}
    </div>
  )
}
