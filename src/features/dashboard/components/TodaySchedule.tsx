/**
 * TodaySchedule — Dashboard widget showing today's appointment list.
 * Clicking a row navigates to Appointments page.
 * Inspired by OHC Care today's patient queue widget.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectTodayAppointments } from '@/store/selectors'
import type { Page } from '@/App'

const STATUS_STYLE: Record<string, string> = {
  scheduled:   'bg-blue-50 text-blue-700',
  arrived:     'bg-amber-50 text-amber-700',
  in_progress: 'bg-[#1B4332]/10 text-[#1B4332]',
  completed:   'bg-gray-100 text-gray-500',
  no_show:     'bg-red-50 text-red-500',
  cancelled:   'bg-gray-50 text-gray-400',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Scheduled', arrived: 'Arrived', in_progress: 'In Progress',
  completed: 'Done', no_show: 'No Show', cancelled: 'Cancelled',
}

export default function TodaySchedule({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const today = useAppSelector(selectTodayAppointments)
  const [collapsed, setCollapsed] = useState(false)

  const pending = today.filter(a => a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no_show')
  const done    = today.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 flex items-center justify-center shrink-0">
            <CalendarDays size={15} className="text-[#1B4332]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Today's Schedule</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {pending.length} pending · {done.length} done
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onNavigate('appointments') }}
            className="text-[11px] text-[#1B4332] font-medium hover:underline hidden sm:block"
          >
            View all →
          </button>
          {collapsed ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronUp size={15} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {today.length === 0 ? (
              <div className="px-5 pb-5 text-sm text-gray-400 flex items-center gap-2">
                <Clock size={14} />
                <span>No appointments scheduled today</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {[...pending, ...done].map((appt, i) => (
                  <motion.button
                    key={appt.id}
                    type="button"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onNavigate('appointments')}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Time */}
                    <div className="text-xs font-mono text-gray-500 shrink-0 w-12">{appt.time}</div>

                    {/* Patient + doctor */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{appt.patient}</div>
                      <div className="text-[11px] text-gray-400 truncate">{appt.doctor} · {appt.type}</div>
                    </div>

                    {/* Status pill */}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[appt.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABEL[appt.status] ?? appt.status}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
