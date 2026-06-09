import type { Appointment } from '@/types/entities'
import { STATUS_STYLE, TYPE_DOT, formatTimeRange, toMin } from '@/lib/appointments'
import { initials } from '@/lib/ui'

export default function ApptCard({ appt, ppm, col, cols, compact, onClick }: {
  appt: Appointment; ppm: number; col: number; cols: number; compact: boolean
  onClick: (a: Appointment) => void
}) {
  const top = toMin(appt.time) * ppm
  const height = Math.max(appt.duration * ppm, 32)
  const s = STATUS_STYLE[appt.status] ?? STATUS_STYLE.scheduled
  const dot = TYPE_DOT[appt.type] ?? 'bg-gray-400'

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(appt) }}
      style={{ top, height, left: `calc(${(col / cols) * 100}% + 2px)`, right: `calc(${((cols - col - 1) / cols) * 100}% + 2px)`, position: 'absolute' }}
      className={`rounded-lg border ${s.card} ${s.cardBg} text-left overflow-hidden hover:brightness-95 active:scale-[0.98] transition-all z-10 flex flex-col`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${s.bar}`} />
      <div className="pl-2.5 pr-1.5 pt-1.5 pb-1 flex-1 min-h-0 flex flex-col justify-between">
        {compact ? (
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
            <span className="text-[9px] font-semibold truncate">{appt.patient.split(' ')[0]}</span>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-4 h-4 rounded-full ${s.bar} flex items-center justify-center text-white text-[7px] font-bold shrink-0`}>
                  {initials(appt.patient)}
                </div>
                <span className="text-[11px] font-semibold truncate">{appt.patient}</span>
              </div>
              {height >= 44 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                  <span className="text-[9px] opacity-75 truncate">{appt.type}</span>
                </div>
              )}
              {height >= 58 && <div className="text-[9px] opacity-60 truncate mt-0.5">{appt.doctor.replace('Dr. ', '')}</div>}
            </div>
            {height >= 52 && <div className="text-[8px] opacity-50 mt-1 font-medium">{formatTimeRange(appt.time, appt.duration)}</div>}
          </>
        )}
      </div>
    </button>
  )
}
