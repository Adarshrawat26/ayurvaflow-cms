import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Clock, Stethoscope, ChevronLeft, ChevronRight,
  Search, Calendar, AlertTriangle, Loader2, ArrowRight,
} from 'lucide-react'
import type { Page } from '../App'
import type { Appointment } from '../types/entities'
import { THERAPIES } from '../data/mockData'
import {
  addDays, formatShortDate, formatWeekRange, getMonthGrid,
  getWeekDates, minutesFromDayStart, monthYearLabel,
  startOfWeek, toISODate,
} from '../lib/dates'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAppointments, selectClinicIndex } from '../store/selectors'
import { createAppointmentApi, updateAppointmentApi } from '../store/thunks/apiThunks'
import {
  DAY_START, DURATION_BY_TYPE, formatTimeRange, HOUR_H, HOURS, NEXT_STATUS, STATUS_LABELS, STATUS_ORDER, STATUS_STYLE, TYPE_DOT,
} from '@/lib/appointments'
import { initials } from '@/lib/ui'
import ApptCard from '../components/ApptCard'
import ModalShell from '../components/ModalShell'
import Swipeable from '../components/Swipeable'

type DoctorLike = { id: string; name: string; specialization: string }
type Appt = Appointment

// ─── Time grid background ─────────────────────────────────────────────────────
function TimeGrid({ onSlotClick }: { onSlotClick: (h: number) => void; date: string }) {
  return (
    <>
      {HOURS.map(h => (
        <div key={h} style={{ height: HOUR_H }} className="relative border-b border-gray-100 group/slot">
          {/* full-hour click zone */}
          <div
            className="absolute inset-0 cursor-pointer hover:bg-[#1B4332]/[0.03] transition-colors flex items-center justify-center opacity-0 group-hover/slot:opacity-100"
            onClick={() => onSlotClick(h)}
          >
            <span className="text-[9px] text-[#1B4332] font-medium bg-[#1B4332]/10 px-2 py-0.5 rounded-full">+ Book</span>
          </div>
          {/* 30-min dashed line */}
          <div className="absolute left-0 right-0 border-b border-dashed border-gray-100" style={{ top: HOUR_H / 2 }} />
        </div>
      ))}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Appointments({ doctors: doctorsProp }: { onNavigate?: (p: Page) => void; user?: unknown; doctors?: DoctorLike[] }) {
  const dispatch = useAppDispatch()
  const appts = useAppSelector(selectAppointments)
  const clinicIndex = useAppSelector(selectClinicIndex)
  const doctorsList = doctorsProp ?? []
  const today = toISODate()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const monthGrid = useMemo(() => getMonthGrid(calYear, calMonth), [calYear, calMonth])

  const [view, setView]           = useState<'week' | 'day' | 'list'>('week')
  const [selectedDay, setDay]     = useState(today)
  const [filterDoc, setFilterDoc] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Appointment['status']>('all')
  const [detail, setDetail]       = useState<Appt | null>(null)
  const [reschedule, setReschedule] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', doctor: '' })
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const dayScrollRef = useRef<HTMLDivElement>(null)
  const [form, setForm]           = useState({
    patient: '', doctor: '', date: today, time: '09:00', type: 'Consultation', duration: '45',
  })

  const weekDateSet = useMemo(() => new Set(weekDates.map(d => d.date)), [weekDates])

  const weekFiltered = useMemo(
    () => clinicIndex.filterAppointments({ dates: weekDateSet, doctor: filterDoc }),
    [clinicIndex, weekDateSet, filterDoc],
  )

  const filtered = useMemo(
    () => clinicIndex.filterAppointments({ dates: weekDateSet, doctor: filterDoc, status: statusFilter }),
    [clinicIndex, weekDateSet, filterDoc, statusFilter],
  )

  const filteredPatients = useMemo(
    () => clinicIndex.searchPatients(patientSearch),
    [clinicIndex, patientSearch],
  )

  const bookingConflict = useMemo(() => {
    if (!form.patient || !form.doctor || !form.date || !form.time) return null
    if (!clinicIndex.hasAppointmentConflict(
      form.date,
      form.time,
      Number(form.duration),
      form.doctor,
      undefined,
      DAY_START,
    )) return null
    return 'This doctor already has an appointment at this time'
  }, [clinicIndex, form])

  const nextToday = useMemo(() => {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    return clinicIndex.getTodayAppointments()
      .filter(a =>
        (filterDoc === 'all' || a.doctor === filterDoc) &&
        a.status !== 'completed' &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show',
      )
      .find(a => {
        const [h, m] = a.time.split(':').map(Number)
        return h * 60 + m + a.duration > nowMin
      })
  }, [clinicIndex, filterDoc])

  const ppm       = HOUR_H / 60
  const nowTop    = selectedDay === today ? minutesFromDayStart(DAY_START) * ppm : -1
  const nowLabel  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  useEffect(() => {
    if (view === 'day' && selectedDay === today && dayScrollRef.current && nowTop >= 0) {
      dayScrollRef.current.scrollTop = Math.max(0, nowTop - 120)
    }
  }, [view, selectedDay, today, nowTop])

  const goToToday = () => {
    setWeekStart(startOfWeek(today))
    setDay(today)
    setCalYear(new Date().getFullYear())
    setCalMonth(new Date().getMonth())
  }

  const shiftWeek = (n: number) => setWeekStart(prev => addDays(prev, n * 7))
  const shiftMonth = (n: number) => {
    const d = new Date(calYear, calMonth + n, 1)
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
  }

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: weekFiltered.filter(a => a.status === s).length }),
    {} as Record<string, number>
  )

  const toggleStatusFilter = (s: Appointment['status']) => {
    setStatusFilter(prev => prev === s ? 'all' : s)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!form.patient) errors.patient = 'Select a patient'
    if (!form.doctor) errors.doctor = 'Select a doctor'
    if (!form.date) errors.date = 'Pick a date'
    if (!form.time) errors.time = 'Pick a time'
    if (bookingConflict) errors.conflict = bookingConflict
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const advance = (id: string) => {
    const appt = appts.find(a => a.id === id)
    if (!appt) return
    const idx = STATUS_ORDER.indexOf(appt.status)
    const next = STATUS_ORDER[idx + 1]
    if (!next || next === 'no_show') return
    const updated = { ...appt, status: next }
    dispatch(updateAppointmentApi(updated))
    if (detail?.id === id) setDetail(updated)
  }

  const markNoShow = (id: string) => {
    const appt = appts.find(a => a.id === id)
    if (!appt) return
    const updated = { ...appt, status: 'no_show' as const }
    dispatch(updateAppointmentApi(updated))
    if (detail?.id === id) setDetail(updated)
  }

  const cancelAppt = (id: string) => {
    const appt = appts.find(a => a.id === id)
    if (!appt) return
    const updated = { ...appt, status: 'cancelled' as const }
    dispatch(updateAppointmentApi(updated))
    if (detail?.id === id) {
      setDetail(updated)
      setReschedule(false)
    }
  }

  const startReschedule = (appt: Appt) => {
    setRescheduleForm({ date: appt.date, time: appt.time, doctor: appt.doctor })
    setReschedule(true)
  }

  const saveReschedule = () => {
    if (!detail) return
    const updated = {
      ...detail,
      date: rescheduleForm.date,
      time: rescheduleForm.time,
      doctor: rescheduleForm.doctor,
    }
    dispatch(updateAppointmentApi(updated))
    setDetail(updated)
    setReschedule(false)
  }

  const book = async () => {
    if (!validateForm()) return
    const patient = clinicIndex.getPatient(form.patient)
    const newAppt: Appt = {
      id: `A${String(appts.length + 1).padStart(3, '0')}`,
      patientId: form.patient,
      patient:   patient?.name || 'New Patient',
      doctor:    form.doctor,
      date:      form.date,
      time:      form.time,
      type:      form.type,
      status:    'scheduled',
      duration:  Number(form.duration),
    }
    setSubmitting(true)
    try {
      await dispatch(createAppointmentApi(newAppt)).unwrap()
      setShowModal(false)
      setPatientSearch('')
      setFormErrors({})
      setForm({ patient: '', doctor: '', date: today, time: '09:00', type: 'Consultation', duration: '45' })
      setDay(form.date)
      setView('day')
    } catch {
      // toast handled in thunk
    } finally {
      setSubmitting(false)
    }
  }

  const openSlot = (date: string, hour: number) => {
    setFormErrors({})
    setPatientSearch('')
    setForm(f => ({
      ...f,
      date,
      time: `${String(hour).padStart(2, '0')}:00`,
      doctor: filterDoc !== 'all' ? filterDoc : f.doctor,
    }))
    setShowModal(true)
  }

  const openBookModal = () => {
    setFormErrors({})
    setPatientSearch('')
    setForm(f => ({ ...f, date: selectedDay }))
    setShowModal(true)
  }

  const closeDetail = () => {
    setDetail(null)
    setReschedule(false)
  }

  // ── day view ────────────────────────────────────────────────────────────────
  const renderDayView = () => {
    const dayAppts  = filtered.filter(a => a.date === selectedDay)
    const laid      = clinicIndex.layoutDayAppointments(dayAppts, DAY_START)
    const isToday   = selectedDay === today

    return (
      <Swipeable
        className="flex flex-col h-full"
        onSwipeLeft={() => setDay(d => addDays(d, 1))}
        onSwipeRight={() => setDay(d => addDays(d, -1))}
      >
        {/* day header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center ${isToday ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-700'}`}>
            <span className="text-[10px] uppercase font-semibold leading-none opacity-70">
              {weekDates.find(d => d.date === selectedDay)?.label}
            </span>
            <span className="text-lg font-bold leading-tight">{selectedDay.slice(-2)}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {isToday ? 'Today' : formatShortDate(selectedDay)}
            </div>
            <div className="text-xs text-gray-400">
              {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}
              {isToday && <span className="ml-2 text-emerald-600 font-medium">· Now {nowLabel}</span>}
            </div>
          </div>
        </div>

        {/* scrollable grid */}
        {dayAppts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
            <Calendar size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-600">No appointments on this day</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Click a time slot or book a new session</p>
            <button type="button" onClick={() => openSlot(selectedDay, 9)} className="btn-primary text-xs">
              <Plus size={14} className="inline mr-1" /> Book for {formatShortDate(selectedDay)}
            </button>
          </div>
        ) : (
          <div ref={dayScrollRef} className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <div className="flex">
              <div className="w-14 shrink-0 select-none">
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_H }} className="flex items-start justify-end pr-3 pt-1.5 border-r border-gray-100">
                    <span className="text-[10px] font-medium text-gray-400">{String(h).padStart(2,'0')}:00</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative">
                <TimeGrid onSlotClick={h => openSlot(selectedDay, h)} date={selectedDay} />
                {isToday && nowTop >= 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: nowTop }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                    <div className="flex-1 h-px bg-red-400" />
                    <span className="text-[9px] text-red-500 font-medium pr-1.5 shrink-0">{nowLabel}</span>
                  </div>
                )}
                {laid.map(a => (
                  <ApptCard key={a.id} appt={a} ppm={ppm} col={a.col} cols={a.cols} compact={false} onClick={setDetail} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Swipeable>
    )
  }

  // ── week view ───────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const hasAny = weekDates.some(d => filtered.some(a => a.date === d.date))
    if (!hasAny) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Calendar size={44} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            {statusFilter !== 'all' ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} appointments` : 'No appointments this week'}
          </p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            {filterDoc !== 'all' ? `Try clearing the doctor filter` : 'Book a session to get started'}
          </p>
          <button type="button" onClick={openBookModal} className="btn-primary text-xs">
            <Plus size={14} className="inline mr-1" /> Book appointment
          </button>
        </div>
      )
    }
    return (
    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
      <div style={{ minWidth: 600 }}>
        {/* sticky header */}
        <div className="flex sticky top-0 bg-white z-20 border-b border-gray-200">
          <div className="w-14 shrink-0 border-r border-gray-100" />
          {weekDates.map(d => {
            const cnt     = filtered.filter(a => a.date === d.date).length
            const isToday = d.date === today
            return (
              <div
                key={d.date}
                onClick={() => { setDay(d.date); setView('day') }}
                className="flex-1 py-2.5 text-center border-l border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isToday ? 'text-[#1B4332]' : 'text-gray-400'}`}>{d.label}</div>
                <div className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${isToday ? 'bg-[#1B4332] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  {d.date.slice(-2)}
                </div>
                <div className="mt-1 flex justify-center gap-0.5">
                  {cnt > 0 && Array.from({ length: Math.min(cnt, 4) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-[#1B4332]/40" />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* grid */}
        <div className="flex">
          {/* time labels */}
          <div className="w-14 shrink-0 border-r border-gray-100 select-none">
            {HOURS.map(h => (
              <div key={h} style={{ height: HOUR_H }} className="flex items-start justify-end pr-3 pt-1.5">
                <span className="text-[10px] font-medium text-gray-400">{String(h).padStart(2,'0')}:00</span>
              </div>
            ))}
          </div>

          {/* day columns */}
          {weekDates.map(d => {
            const dayAppts = filtered.filter(a => a.date === d.date)
            const laid     = clinicIndex.layoutDayAppointments(dayAppts, DAY_START)
            const isToday  = d.date === today
            return (
              <div key={d.date} className={`flex-1 relative border-l border-gray-100 ${isToday ? 'bg-[#1B4332]/[0.015]' : ''}`}>
                <TimeGrid onSlotClick={h => openSlot(d.date, h)} date={d.date} />
                {/* now line */}
                {isToday && nowTop >= 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: nowTop }}>
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                    <div className="flex-1 h-px bg-red-400" />
                  </div>
                )}
                {laid.map(a => (
                  <ApptCard key={a.id} appt={a} ppm={ppm} col={a.col} cols={a.cols} compact onClick={setDetail} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
    )
  }

  // ── list view ───────────────────────────────────────────────────────────────
  const renderListView = () => {
    const grouped = weekDates.reduce((acc, d) => {
      const dayAppts = filtered.filter(a => a.date === d.date)
      if (dayAppts.length) acc.push({ ...d, appts: dayAppts })
      return acc
    }, [] as ({ label: string; date: string; appts: Appt[] })[])

    return (
      <div className="divide-y divide-gray-100">
        {grouped.length === 0 && (
          <div className="py-16 text-center px-6">
            <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Nothing scheduled this week</p>
            <p className="text-xs text-gray-400 mt-1">Switch view or book a new appointment</p>
          </div>
        )}
        {grouped.map(g => (
          <div key={g.date}>
            <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
              <span className={`text-xs font-semibold ${g.date === today ? 'text-[#1B4332]' : 'text-gray-600'}`}>
                {g.date === today ? 'Today · ' : ''}{g.label}, {formatShortDate(g.date)}
              </span>
              <span className="text-[10px] text-gray-400">{g.appts.length} appointment{g.appts.length > 1 ? 's' : ''}</span>
            </div>
            {g.appts.map(a => {
              const s   = STATUS_STYLE[a.status] ?? STATUS_STYLE.scheduled
              const dot = TYPE_DOT[a.type] ?? 'bg-gray-400'
              return (
                <button
                  key={a.id}
                  onClick={() => setDetail(a)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  {/* avatar */}
                  <div className={`w-9 h-9 rounded-full ${s.bar} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {initials(a.patient)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{a.patient}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                      <span className="text-xs text-gray-500 truncate">{a.type} · {a.doctor.replace('Dr. ', '')}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-gray-900">{a.time}</div>
                    <div className="text-[10px] text-gray-400">{a.duration}m</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${s.pill}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col lg:flex-row h-full">

      {/* ── Left sidebar (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 border-r border-gray-200 bg-white p-4 gap-5">

        {/* mini month */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700">{monthYearLabel(calYear, calMonth)}</span>
            <div className="flex gap-0.5">
              <button type="button" onClick={() => shiftMonth(-1)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><ChevronLeft size={12} /></button>
              <button type="button" onClick={() => shiftMonth(1)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><ChevronRight size={12} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-[9px] font-semibold text-gray-400 text-center py-0.5">{d}</div>
            ))}
          </div>
          <div className="space-y-0.5">
            {monthGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((day, di) => {
                  if (!day) return <div key={di} />
                  const dateStr = toISODate(new Date(calYear, calMonth, day))
                  const hasAppts = clinicIndex.appointmentDates.has(dateStr)
                  const isToday  = dateStr === today
                  const isSel    = dateStr === selectedDay
                  return (
                    <button
                      key={di}
                      onClick={() => { setDay(dateStr); setView('day') }}
                      className={`relative w-full aspect-square rounded-md flex items-center justify-center text-[11px] font-medium transition-all ${
                        isToday  ? 'bg-[#1B4332] text-white' :
                        isSel    ? 'bg-[#1B4332]/10 text-[#1B4332]' :
                        'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                      {hasAppts && !isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#52B788]" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* doctor filter */}
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Filter by Doctor</div>
          <div className="space-y-0.5">
            {[{ id: 'all', name: 'All Doctors', specialization: '' }, ...doctorsList].map(d => (
              <button
                key={d.id}
                onClick={() => setFilterDoc(d.id === 'all' ? 'all' : d.name)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                  (d.id === 'all' ? filterDoc === 'all' : filterDoc === d.name)
                    ? 'bg-[#1B4332]/10 text-[#1B4332] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d.id !== 'all' && (
                  <div className="w-5 h-5 rounded-full bg-[#1B4332]/20 flex items-center justify-center text-[8px] font-bold text-[#1B4332] shrink-0">
                    {d.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                  </div>
                )}
                <span className="truncate">{d.id === 'all' ? 'All Doctors' : d.name.replace('Dr. ', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* status summary — clickable filters */}
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">This Week</div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                statusFilter === 'all' ? 'bg-[#1B4332]/10 text-[#1B4332] font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All</span>
              <span className="font-bold">{weekFiltered.length}</span>
            </button>
            {STATUS_ORDER.filter(s => s !== 'no_show' || counts[s] > 0).map(s => {
              const st = STATUS_STYLE[s]
              const active = statusFilter === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatusFilter(s)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active ? 'bg-[#1B4332]/10 text-[#1B4332] font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className="capitalize">{STATUS_LABELS[s]}</span>
                  </div>
                  <span className="font-bold">{counts[s]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* legend */}
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Therapy types</div>
          <div className="space-y-1">
            {[
              { label: 'Consultation', color: 'bg-blue-500' },
              { label: 'Panchakarma',  color: 'bg-[#1B4332]' },
              { label: 'Oil therapies',color: 'bg-amber-500' },
              { label: 'Kizhi',        color: 'bg-emerald-500' },
              { label: 'Other',        color: 'bg-purple-500' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-sm ${l.color} shrink-0`} />
                <span className="text-[10px] text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main calendar area ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* next-up banner */}
        {nextToday && selectedDay === today && (
          <button
            type="button"
            onClick={() => setDetail(nextToday)}
            className="flex items-center gap-3 px-4 py-2.5 bg-[#1B4332]/5 border-b border-[#1B4332]/10 text-left hover:bg-[#1B4332]/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials(nextToday.patient)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-[#1B4332] font-semibold">Up next today</div>
              <div className="text-sm font-medium text-gray-900 truncate">{nextToday.patient} · {nextToday.type}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-[#1B4332]">{nextToday.time}</div>
              <div className="text-[10px] text-gray-400">{STATUS_LABELS[nextToday.status]}</div>
            </div>
            <ArrowRight size={16} className="text-[#1B4332] shrink-0" />
          </button>
        )}

        {/* toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shiftWeek(-1)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{formatWeekRange(weekStart)}</span>
            <button type="button" onClick={() => shiftWeek(1)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"><ChevronRight size={14} /></button>
            <button type="button" onClick={goToToday} className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-[#1B4332] font-medium hover:bg-[#1B4332]/5 transition-colors">Today</button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 bg-gray-100 rounded-lg">
              {(['day','week','list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{v}</button>
              ))}
            </div>

            <button type="button" onClick={openBookModal} className="btn-primary flex items-center gap-1.5 shrink-0">
              <Plus size={14} /> <span className="hidden sm:inline">Book</span>
            </button>
          </div>
        </div>

        {/* mobile week day strip */}
        <div className="lg:hidden flex gap-1 px-3 py-2 border-b border-gray-100 bg-white overflow-x-auto">
          {weekDates.map(d => {
            const cnt = filtered.filter(a => a.date === d.date).length
            const isSel = selectedDay === d.date
            const isToday = d.date === today
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => { setDay(d.date); setView('day') }}
                className={`flex flex-col items-center min-w-[44px] py-1.5 px-1 rounded-xl transition-all shrink-0 ${
                  isSel ? 'bg-[#1B4332] text-white' :
                  isToday ? 'bg-[#1B4332]/10 text-[#1B4332]' :
                  'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-[9px] font-semibold uppercase">{d.label}</span>
                <span className="text-sm font-bold leading-tight">{d.date.slice(-2)}</span>
                {cnt > 0 && (
                  <span className={`text-[8px] mt-0.5 font-medium ${isSel ? 'text-white/80' : 'text-gray-400'}`}>{cnt}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* mobile status filter strip */}
        <div className="lg:hidden flex gap-2 px-4 py-2 border-b border-gray-100 overflow-x-auto bg-white">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'all' ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All {weekFiltered.length}
          </button>
          {STATUS_ORDER.filter(s => s !== 'no_show' || counts[s] > 0).map(s => {
            const st = STATUS_STYLE[s]
            const active = statusFilter === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatusFilter(s)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  active ? `${st.pill} ring-2 ring-offset-1 ring-[#1B4332]/30` : st.pill
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                <span>{STATUS_LABELS[s]}</span>
                <span className="font-bold">{counts[s]}</span>
              </button>
            )
          })}
        </div>

        {/* calendar body */}
        <div className="flex-1 bg-white">
          {view === 'week' && renderWeekView()}
          {view === 'day'  && renderDayView()}
          {view === 'list' && renderListView()}
        </div>

        {/* hint */}
        {view !== 'list' && (
          <div className="px-4 py-2 border-t border-gray-100 bg-white">
            <span className="text-[10px] text-gray-400">Swipe to change day · Tap a slot to book · Pull modal down to close</span>
          </div>
        )}
      </div>

      {/* ── Appointment detail panel ── */}
      {detail && (
        <ModalShell
          open
          onClose={closeDetail}
          onBack={reschedule ? () => setReschedule(false) : undefined}
          backLabel="Appointment"
          title={reschedule ? 'Reschedule' : detail.patient}
          subtitle={reschedule ? `${detail.type} · ${formatShortDate(detail.date)}` : detail.type}
          maxWidth="sm"
        >
          {(() => {
              const s   = STATUS_STYLE[detail.status] ?? STATUS_STYLE.scheduled
              const dot = TYPE_DOT[detail.type] ?? 'bg-gray-400'
              return (
                <>
                  <div className={`${s.cardBg} px-5 py-4 border-b ${s.card.split(' ').find(c => c.startsWith('border-')) ?? 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full ${s.bar} flex items-center justify-center text-white font-bold shrink-0`}>
                        {initials(detail.patient)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                          <span className="text-xs text-gray-600 truncate">{detail.type}</span>
                        </div>
                        <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${s.pill}`}>
                          {STATUS_LABELS[detail.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-gray-400 shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{formatTimeRange(detail.time, detail.duration)}</div>
                          <div className="text-xs text-gray-400">{detail.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Stethoscope size={14} className="text-gray-400 shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 text-xs leading-tight">{detail.doctor}</div>
                          <div className="text-xs text-gray-400">{detail.duration} min</div>
                        </div>
                      </div>
                    </div>

                    {/* status stepper */}
                    <div className="flex items-center gap-1">
                      {STATUS_ORDER.filter(s => s !== 'no_show').map((s, i, arr) => {
                        const cur  = STATUS_ORDER.indexOf(detail.status)
                        const idx  = STATUS_ORDER.indexOf(s)
                        const done = idx <= cur && detail.status !== 'no_show'
                        const active = s === detail.status
                        const st   = STATUS_STYLE[s]
                        return (
                          <div key={s} className="flex items-center flex-1 min-w-0">
                            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${done ? st.dot : 'bg-gray-100 border border-gray-200'}`}>
                                {done && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className={`text-[9px] font-medium text-center leading-tight truncate w-full ${active ? 'text-[#1B4332] font-semibold' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                                {STATUS_LABELS[s]}
                              </span>
                            </div>
                            {i < arr.length - 1 && (
                              <div className={`h-0.5 w-full max-w-[20px] shrink-0 mb-4 ${idx < cur ? st.dot : 'bg-gray-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {detail.status === 'no_show' && (
                      <div className="text-xs text-center text-red-600 bg-red-50 rounded-lg py-2 border border-red-100">Marked as no-show</div>
                    )}
                    {detail.status === 'cancelled' && (
                      <div className="text-xs text-center text-gray-600 bg-gray-50 rounded-lg py-2 border border-gray-200">This appointment was cancelled</div>
                    )}

                    {reschedule && detail.status !== 'cancelled' && detail.status !== 'completed' && (
                      <div className="space-y-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <input type="date" className="input-field text-xs" value={rescheduleForm.date} onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))} />
                        <input type="time" className="input-field text-xs" value={rescheduleForm.time} onChange={e => setRescheduleForm(f => ({ ...f, time: e.target.value }))} />
                        <select className="input-field text-xs" value={rescheduleForm.doctor} onChange={e => setRescheduleForm(f => ({ ...f, doctor: e.target.value }))}>
                          {doctorsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button type="button" className="btn-outline flex-1 text-xs" onClick={() => setReschedule(false)}>Cancel</button>
                          <button type="button" className="btn-primary flex-1 text-xs" onClick={saveReschedule}>Save</button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {detail.status !== 'completed' && detail.status !== 'no_show' && detail.status !== 'cancelled' && !reschedule && (
                        <>
                          <button type="button" onClick={() => markNoShow(detail.id)} className="px-3 py-2.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                            No-show
                          </button>
                          <button type="button" onClick={() => startReschedule(detail)} className="px-3 py-2.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                            Reschedule
                          </button>
                          <button type="button" onClick={() => cancelAppt(detail.id)} className="px-3 py-2.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                            Cancel
                          </button>
                          <button type="button" onClick={() => advance(detail.id)} className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5 min-w-[120px]">
                            {NEXT_STATUS[detail.status] ?? 'Advance'}
                            <ArrowRight size={14} />
                          </button>
                        </>
                      )}
                      {(detail.status === 'completed' || detail.status === 'no_show' || detail.status === 'cancelled') && (
                        <button type="button" onClick={closeDetail} className="btn-outline flex-1 text-xs">Close</button>
                      )}
                    </div>
                  </div>
                </>
              )
            })()}
        </ModalShell>
      )}

      {/* ── Book modal ── */}
      {showModal && (
        <ModalShell
          open
          onClose={() => setShowModal(false)}
          preventClose={submitting}
          title="Book Appointment"
          subtitle="Schedule a new session"
        >
          <div className="p-5 lg:p-6">
            {/* slot summary */}
            <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/10">
              <Calendar size={18} className="text-[#1B4332] shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">{formatShortDate(form.date)}</div>
                <div className="text-xs text-gray-500">{form.time} · {form.duration} min</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Patient</label>
                <div className="relative mb-1.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input-field pl-9"
                    placeholder="Search by name, phone, or ID…"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                </div>
                <select
                  className={`input-field ${formErrors.patient ? 'border-red-400' : ''}`}
                  value={form.patient}
                  onChange={e => { setForm({ ...form, patient: e.target.value }); setFormErrors(prev => ({ ...prev, patient: '' })) }}
                >
                  <option value="">Select patient</option>
                  {filteredPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} · {p.prakriti} · {p.phone}</option>
                  ))}
                </select>
                {formErrors.patient && <p className="text-xs text-red-500 mt-1">{formErrors.patient}</p>}
                {patientSearch && filteredPatients.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No patients match your search</p>
                )}
              </div>
              <div>
                <label className="label">Doctor</label>
                <select
                  className={`input-field ${formErrors.doctor ? 'border-red-400' : ''}`}
                  value={form.doctor}
                  onChange={e => { setForm({ ...form, doctor: e.target.value }); setFormErrors(prev => ({ ...prev, doctor: '' })) }}
                >
                  <option value="">Select doctor</option>
                  {doctorsList.map(d => <option key={d.id} value={d.name}>{d.name} · {d.specialization}</option>)}
                </select>
                {formErrors.doctor && <p className="text-xs text-red-500 mt-1">{formErrors.doctor}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input
                    className={`input-field ${formErrors.date ? 'border-red-400' : ''}`}
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    className={`input-field ${formErrors.time ? 'border-red-400' : ''}`}
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Therapy / Type</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={e => {
                      const type = e.target.value
                      const dur = DURATION_BY_TYPE[type]
                      setForm(f => ({ ...f, type, duration: dur ? String(dur) : f.duration }))
                    }}
                  >
                    {['Consultation', 'Follow-up', ...THERAPIES].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <select className="input-field" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                    {[['30','30 min'],['45','45 min'],['60','1 hour'],['90','1.5 hrs'],['120','2 hours']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(bookingConflict || formErrors.conflict) && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{formErrors.conflict ?? bookingConflict}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" className="btn-outline flex-1" disabled={submitting} onClick={() => setShowModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={submitting || !!bookingConflict}
                onClick={book}
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Booking…</> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}
