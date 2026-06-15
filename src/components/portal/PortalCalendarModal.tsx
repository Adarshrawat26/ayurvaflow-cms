import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ModalShell from '../ModalShell'
import {
  formatDisplayDate,
  formatShortDate,
  getMonthGrid,
  monthYearLabel,
  parseISODate,
  toISODate,
} from '@/lib/dates'
import { formatTimeRange } from '@/lib/appointments'
import type { Appointment } from '@/types/entities'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_STYLE: Record<Appointment['status'], string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  arrived: 'bg-amber-50 text-amber-700 border-amber-100',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
  completed: 'bg-gray-50 text-gray-500 border-gray-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
  no_show: 'bg-red-50 text-red-600 border-red-100',
}

interface Props {
  open: boolean
  onClose: () => void
  appointments: Appointment[]
  selectedDate: string
  today: string
  careDoctor: string | null
  onSelectDate: (iso: string) => void
}

export default function PortalCalendarModal({
  open,
  onClose,
  appointments,
  selectedDate,
  today,
  careDoctor,
  onSelectDate,
}: Props) {
  const initial = parseISODate(selectedDate)
  const [calYear, setCalYear] = useState(initial.getFullYear())
  const [calMonth, setCalMonth] = useState(initial.getMonth())

  useEffect(() => {
    if (!open) return
    const d = parseISODate(selectedDate)
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
  }, [open, selectedDate])

  const monthGrid = useMemo(() => getMonthGrid(calYear, calMonth), [calYear, calMonth])
  const apptDates = useMemo(() => new Set(appointments.map(a => a.date)), [appointments])

  const upcoming = useMemo(
    () => [...appointments]
      .filter(a => (a.status === 'scheduled' || a.status === 'arrived') && a.date >= today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments, today],
  )

  const past = useMemo(
    () => [...appointments]
      .filter(a =>
        a.date < today ||
        a.status === 'completed' ||
        a.status === 'cancelled' ||
        a.status === 'no_show',
      )
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [appointments, today],
  )

  const shiftMonth = (delta: number) => {
    const d = new Date(calYear, calMonth + delta, 1)
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
  }

  const handlePick = (iso: string) => {
    if (iso < today) return
    onSelectDate(iso)
    onClose()
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Your calendar"
      subtitle={careDoctor ?? 'All appointments'}
      maxWidth="lg"
    >
      <div className="p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-gray-900">{monthYearLabel(calYear, calMonth)}</span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-[10px] font-semibold text-gray-400 text-center py-1">{d}</div>
            ))}
          </div>

          <div className="space-y-1">
            {monthGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (!day) return <div key={di} />
                  const iso = toISODate(new Date(calYear, calMonth, day))
                  const isPast = iso < today
                  const isToday = iso === today
                  const isSelected = iso === selectedDate
                  const hasAppt = apptDates.has(iso)
                  return (
                    <button
                      key={di}
                      type="button"
                      disabled={isPast}
                      onClick={() => handlePick(iso)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${
                        isSelected ? 'bg-[#1B4332] text-white ring-2 ring-[#1B4332] ring-offset-1'
                          : isToday ? 'bg-[#1B4332]/10 text-[#1B4332] font-semibold'
                            : isPast ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                      {hasAppt && (
                        <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#52B788]'
                        }`} />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3">
            Tap a future date to book · green dot = existing visit
          </p>
        </div>

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.map(a => (
                <div key={a.id} className="card p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{formatDisplayDate(a.date)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatTimeRange(a.time, a.duration)} · {a.type}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{a.doctor}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Past visits</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {past.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0 text-sm">
                  <div className="min-w-0">
                    <span className="text-gray-700">{formatShortDate(a.date)}</span>
                    <span className="text-gray-400 mx-1.5">·</span>
                    <span className="text-gray-500">{a.time}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {appointments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No appointments yet — pick a date above to book.</p>
        )}
      </div>
    </ModalShell>
  )
}
