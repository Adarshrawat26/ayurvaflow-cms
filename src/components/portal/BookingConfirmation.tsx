import { CheckCircle2, CalendarClock, CreditCard, Download } from 'lucide-react'
import { formatDisplayDate } from '@/lib/dates'
import { formatTimeRange } from '@/lib/appointments'
import type { BookingConfirmation as Confirmation } from '@/lib/booking'

interface Props {
  data: Confirmation
  patientName: string
  onDone: () => void
}

export default function BookingConfirmation({ data, patientName, onDone }: Props) {
  const { appointment: a, payment, confirmationId } = data
  const methodLabel = payment.method === 'upi' ? 'UPI' : payment.method === 'card' ? 'Card' : 'Net banking'

  return (
    <div className="space-y-5 max-w-lg mx-auto text-center py-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">You&apos;re booked!</h2>
        <p className="text-sm text-gray-500 mt-1">
          {patientName.split(' ')[0]}, your follow-up is confirmed
        </p>
      </div>

      <div className="card p-5 text-left space-y-4 border-emerald-100 bg-emerald-50/40">
        <div className="text-center pb-3 border-b border-emerald-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Confirmation</p>
          <p className="text-lg font-bold text-[#1B4332] mt-0.5">{confirmationId}</p>
        </div>

        <div className="flex items-start gap-3">
          <CalendarClock size={18} className="text-[#1B4332] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{a.type}</p>
            <p className="text-sm text-gray-700 mt-0.5">{formatDisplayDate(a.date)}</p>
            <p className="text-xs text-gray-500">{formatTimeRange(a.time, a.duration)} · {a.doctor}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-emerald-100">
          <CreditCard size={18} className="text-[#1B4332] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString('en-IN')} paid</p>
            <p className="text-xs text-gray-500">{methodLabel} · {payment.txnId}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 px-4">
        A receipt has been saved to your account. Show this confirmation at reception if needed.
      </p>

      <div className="flex flex-col gap-2 pt-2">
        <button type="button" className="btn-primary w-full" onClick={onDone}>
          Done
        </button>
        <button
          type="button"
          className="w-full py-2.5 text-sm text-gray-600 flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          <Download size={14} /> Save / print
        </button>
      </div>
    </div>
  )
}
