/**
 * SlotPicker — Visual grid of available 30-min appointment slots.
 * Grayed/strikethrough = already booked for that doctor+date.
 * Inspired by OpenMRS appointment slot grid module.
 *
 * Usage:
 *   <SlotPicker doctor="Dr. Ananya" date="2025-01-15" value={time} onChange={setTime} />
 */
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAppSelector } from '@/store/hooks'

const generateAllSlots = () => {
  const slots: string[] = []
  for (let h = 8; h < 20; h++) {
    for (const m of [0, 30]) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}
const ALL_SLOTS = generateAllSlots()

const fmt12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const ampm = (h ?? 0) < 12 ? 'am' : 'pm'
  const h12 = (h ?? 0) % 12 || 12
  return `${h12}:${String(m ?? 0).padStart(2, '0')}${ampm}`
}

interface SlotPickerProps {
  doctor: string
  date: string
  value: string
  onChange: (time: string) => void
  disabled?: boolean
}

export default function SlotPicker({ doctor, date, value, onChange, disabled }: SlotPickerProps) {
  const token = useAppSelector(s => s.auth.token)
  const [available, setAvailable] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!doctor || !date || !token) { setAvailable(null); return }
    setLoading(true)
    setWarning(null)
    let cancelled = false
    api.getSlots(token, doctor, date)
      .then(data => { if (!cancelled) setAvailable(data.available) })
      .catch(() => {
        if (!cancelled) {
          setAvailable(ALL_SLOTS)
          setWarning('Could not fetch live availability — showing all slots')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [doctor, date, token])

  if (!doctor || !date) {
    return <div className="text-xs text-gray-400 py-2">Select a doctor and date first</div>
  }
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
        <Loader2 size={13} className="animate-spin" /> Checking availability…
      </div>
    )
  }

  const slots = available ?? ALL_SLOTS
  const bookedSet = new Set(ALL_SLOTS.filter(s => !slots.includes(s)))
  const am = ALL_SLOTS.filter(s => Number(s.split(':')[0]) < 12)
  const pm = ALL_SLOTS.filter(s => Number(s.split(':')[0]) >= 12)

  const SlotBtn = ({ time }: { time: string }) => {
    const booked = bookedSet.has(time)
    const selected = value === time
    return (
      <button
        type="button"
        disabled={booked || disabled}
        onClick={() => onChange(time)}
        title={booked ? 'Already booked' : fmt12(time)}
        className={[
          'px-2 py-1.5 rounded-lg text-xs font-medium transition-all border',
          selected
            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
            : booked
              ? 'bg-gray-50 text-gray-300 border-gray-100 line-through cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#1B4332] hover:text-[#1B4332] hover:bg-[#1B4332]/5',
        ].join(' ')}
      >
        {fmt12(time)}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {warning && (
        <div className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
          {warning}
        </div>
      )}
      <div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Morning</div>
        <div className="flex flex-wrap gap-1.5">{am.map(t => <SlotBtn key={t} time={t} />)}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Afternoon / Evening</div>
        <div className="flex flex-wrap gap-1.5">{pm.map(t => <SlotBtn key={t} time={t} />)}</div>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1B4332] inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Booked
        </span>
        <span>· 30min slots</span>
      </div>
    </div>
  )
}
