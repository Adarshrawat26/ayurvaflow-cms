import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import { addDays, formatShortDate, startOfWeek, toISODate } from '@/lib/dates'
import { formatTimeRange } from '@/lib/appointments'
import {
  FOLLOW_UP_FEE,
  PAYMENT_OPTIONS,
  type BookingConfirmation,
  type PortalPaymentMethod,
} from '@/lib/booking'
import type { Appointment } from '@/types/entities'
import BookingConfirmationView from './BookingConfirmation'
import PortalCalendarModal from './PortalCalendarModal'

interface Props {
  token: string
  patientName: string
  careDoctor: string | null
  appointments: Appointment[]
  onBooked: () => void
}

type Step = 'pick' | 'pay' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'pick', label: 'Time' },
  { id: 'pay', label: 'Pay' },
  { id: 'done', label: 'Done' },
]

export default function PortalBooking({ token, patientName, careDoctor, appointments, onBooked }: Props) {
  const firstName = patientName.split(' ')[0]
  const today = toISODate()
  const [step, setStep] = useState<Step>('pick')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<PortalPaymentMethod | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [fee, setFee] = useState(FOLLOW_UP_FEE)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )
  const myDates = useMemo(() => new Set(appointments.map(a => a.date)), [appointments])

  const nextVisit = useMemo(
    () => [...appointments]
      .filter(a => a.status === 'scheduled' || a.status === 'arrived')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0],
    [appointments],
  )

  const loadAvailability = useCallback(async () => {
    if (!careDoctor) {
      setSlots([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await api.portalAvailability(token, selectedDate)
      const mine = data.doctors.find(d => d.name === careDoctor) ?? data.doctors[0]
      setSlots(mine?.availableSlots ?? [])
    } catch {
      toast.error('Could not load slots')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [token, selectedDate, careDoctor])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  useEffect(() => {
    api.portalBookingFee(token)
      .then(q => setFee({ label: q.label, subtotal: q.subtotal, tax: q.tax, total: q.total }))
      .catch(() => {})
  }, [token])

  const pickDate = (iso: string) => {
    if (iso < today) return
    setSelectedDate(iso)
    setWeekStart(startOfWeek(iso))
    setSelectedTime(null)
  }

  const pickTime = (time: string) => {
    setSelectedTime(time)
    setStep('pay')
  }

  const pay = async (method: PortalPaymentMethod) => {
    if (!careDoctor || !selectedTime) return
    setPaying(method)
    try {
      const result = await api.portalBookAppointment(token, {
        date: selectedDate,
        time: selectedTime,
        doctor: careDoctor,
        type: 'Follow-up',
        duration: 45,
        paymentMethod: method,
      })
      setConfirmation(result)
      setStep('done')
      onBooked()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Payment failed')
    } finally {
      setPaying(null)
    }
  }

  const reset = () => {
    setStep('pick')
    setSelectedTime(null)
    setConfirmation(null)
    loadAvailability()
  }

  if (step === 'done' && confirmation) {
    return (
      <BookingConfirmationView
        data={confirmation}
        patientName={patientName}
        onDone={reset}
      />
    )
  }

  const stepIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Hi {firstName}</h2>
        <p className="text-sm text-gray-500 mt-0.5">Book your follow-up in 2 taps</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.slice(0, 2).map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
              i <= stepIndex ? 'bg-[#1B4332] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= stepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 1 && <div className={`flex-1 h-px ${step === 'pay' ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {nextVisit && step === 'pick' && (
        <div className="card p-3 border-[#1B4332]/15 bg-[#1B4332]/[0.03] text-sm">
          <span className="text-[10px] uppercase tracking-wide text-[#1B4332] font-semibold">Up next · </span>
          <span className="text-gray-700">
            {formatShortDate(nextVisit.date)} {nextVisit.time}
          </span>
        </div>
      )}

      {!careDoctor ? (
        <div className="card p-6 text-center text-sm text-gray-500">
          Call reception to link your doctor before booking online.
        </div>
      ) : step === 'pick' ? (
        <>
          <div className="card p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs text-gray-500 truncate">{careDoctor}</p>
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-[#1B4332] bg-[#1B4332]/5 hover:bg-[#1B4332]/10 shrink-0"
              >
                <CalendarDays size={14} />
                Full view
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Previous week"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex-1 grid grid-cols-7 gap-1">
                {weekDates.map(iso => {
                  const d = new Date(iso + 'T12:00:00')
                  const isPast = iso < today
                  const active = iso === selectedDate
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isPast}
                      onClick={() => pickDate(iso)}
                      className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                        active ? 'bg-[#1B4332] text-white'
                          : isPast ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-[9px] opacity-80">{d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2)}</span>
                      <span className="text-sm font-semibold">{d.getDate()}</span>
                      {myDates.has(iso) && (
                        <span className={`w-1 h-1 rounded-full mt-0.5 ${active ? 'bg-white' : 'bg-[#52B788]'}`} />
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Next week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="card p-4">
            <p className="text-xs font-medium text-gray-700 mb-3">
              Pick a time · {formatShortDate(selectedDate)}
            </p>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-[#1B4332]" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No slots this day — try another date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => pickTime(time)}
                    className="py-3 rounded-xl border-2 border-[#1B4332]/15 bg-white text-sm font-semibold text-[#1B4332] hover:border-[#1B4332] hover:bg-[#1B4332]/5 active:scale-[0.98] transition-all"
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Follow-up fee ₹{fee.total.toLocaleString('en-IN')} · pay on next step
            </p>
          </div>

          <PortalCalendarModal
            open={calendarOpen}
            onClose={() => setCalendarOpen(false)}
            appointments={appointments}
            selectedDate={selectedDate}
            today={today}
            careDoctor={careDoctor}
            onSelectDate={pickDate}
          />
        </>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep('pick')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={14} /> Change time
          </button>

          <div className="card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Your booking</p>
            <p className="text-base font-semibold text-gray-900">{fee.label}</p>
            <p className="text-sm text-gray-600">
              {formatShortDate(selectedDate!)} · {selectedTime && formatTimeRange(selectedTime, 45)}
            </p>
            <p className="text-xs text-gray-500">{careDoctor}</p>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Total (incl. GST)</span>
              <span className="text-xl font-bold text-[#1B4332]">₹{fee.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 px-1">Pay securely</p>
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                disabled={paying !== null}
                onClick={() => pay(opt.id)}
                className="card w-full p-4 flex items-center justify-between hover:border-[#1B4332]/40 transition-colors disabled:opacity-60"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.hint}</p>
                </div>
                {paying === opt.id ? (
                  <Loader2 size={18} className="animate-spin text-[#1B4332]" />
                ) : (
                  <span className="text-xs font-medium text-[#1B4332]">Pay ₹{fee.total.toLocaleString('en-IN')}</span>
                )}
              </button>
            ))}
          </div>

          {import.meta.env.DEV && (
            <p className="text-[10px] text-gray-400 text-center">
              Simulated payment for demo — connects to Razorpay in production
            </p>
          )}
        </div>
      )}
    </div>
  )
}
