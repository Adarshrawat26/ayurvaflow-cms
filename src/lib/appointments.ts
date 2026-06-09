import type { Appointment } from '@/types/entities'

export const DAY_START = 8
export const DAY_END = 19
export const HOUR_H = 80
export const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => i + DAY_START)

export const STATUS_STYLE: Record<string, { pill: string; card: string; cardBg: string; dot: string; bar: string }> = {
  scheduled:   { pill: 'bg-blue-100 text-blue-700',       card: 'border-blue-300 text-blue-900',   cardBg: 'bg-blue-50',    dot: 'bg-blue-400',    bar: 'bg-blue-400' },
  arrived:     { pill: 'bg-amber-100 text-amber-700',     card: 'border-amber-300 text-amber-900', cardBg: 'bg-amber-50',   dot: 'bg-amber-400',   bar: 'bg-amber-400' },
  in_progress: { pill: 'bg-emerald-100 text-emerald-700', card: 'border-emerald-300 text-emerald-900', cardBg: 'bg-emerald-50', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  completed:   { pill: 'bg-gray-100 text-gray-500',       card: 'border-gray-200 text-gray-500',   cardBg: 'bg-gray-50',    dot: 'bg-gray-400',    bar: 'bg-gray-300' },
  no_show:     { pill: 'bg-red-100 text-red-600',         card: 'border-red-200 text-red-700',     cardBg: 'bg-red-50',     dot: 'bg-red-400',     bar: 'bg-red-400' },
  cancelled:   { pill: 'bg-gray-100 text-gray-500',       card: 'border-gray-300 text-gray-500',   cardBg: 'bg-gray-50',    dot: 'bg-gray-400',    bar: 'bg-gray-400' },
}

export const TYPE_DOT: Record<string, string> = {
  Consultation: 'bg-blue-500', 'Follow-up': 'bg-violet-500', Abhyangam: 'bg-amber-500',
  Shirodhara: 'bg-cyan-500', Pizhichil: 'bg-teal-500', Navarakizhi: 'bg-emerald-600',
  Elakizhi: 'bg-green-500', Udhwarthanam: 'bg-orange-500', Kadikizhi: 'bg-yellow-500',
  Nasyam: 'bg-purple-500', Basti: 'bg-indigo-500', Panchakarma: 'bg-[#1B4332]',
  Rasayana: 'bg-lime-600', 'Veda Diet Program': 'bg-rose-500',
}

export const STATUS_ORDER: Appointment['status'][] = ['scheduled', 'arrived', 'in_progress', 'completed', 'no_show']
export const STATUS_LABELS: Record<Appointment['status'], string> = {
  scheduled: 'Scheduled', arrived: 'Arrived', in_progress: 'In progress',
  completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
}
export const NEXT_STATUS: Partial<Record<Appointment['status'], string>> = {
  scheduled: 'Mark arrived', arrived: 'Start session', in_progress: 'Complete',
}
export const DURATION_BY_TYPE: Record<string, number> = {
  Consultation: 45, 'Follow-up': 45, Panchakarma: 90, Abhyangam: 60, Shirodhara: 60,
  Pizhichil: 90, Navarakizhi: 60, Elakizhi: 60, Udhwarthanam: 60,
}

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h - DAY_START) * 60 + m
}

export const formatTimeRange = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number)
  const end = h * 60 + m + duration
  return `${time} – ${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
}
