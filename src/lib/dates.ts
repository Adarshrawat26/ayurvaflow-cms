/** ISO date string YYYY-MM-DD in local timezone */
export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function startOfWeek(iso: string): string {
  const d = parseISODate(iso)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function getWeekDates(weekStartISO: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStartISO, i)
    const d = parseISODate(date)
    return { label: DAY_LABELS[d.getDay()], date }
  })
}

export function formatDisplayDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatWeekRange(weekStartISO: string): string {
  const end = addDays(weekStartISO, 6)
  const startD = parseISODate(weekStartISO)
  const endD = parseISODate(end)
  const startStr = startD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const endStr = endD.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: startD.getFullYear() !== endD.getFullYear() ? 'numeric' : undefined,
  })
  return `${startStr} – ${endStr}`
}

export function getMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function monthYearLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/** Minutes from dayStart hour to now (for calendar "current time" line) */
export function minutesFromDayStart(dayStartHour: number): number {
  const now = new Date()
  return (now.getHours() - dayStartHour) * 60 + now.getMinutes()
}
