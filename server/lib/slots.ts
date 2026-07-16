import { hasSameDayConflict } from './intervals.js'

export const SLOT_INTERVAL = 30
export const DEFAULT_DURATION = 45

export function timeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minToTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export function generateSlotTimes(
  openTime: string,
  closeTime: string,
  duration = DEFAULT_DURATION,
  interval = SLOT_INTERVAL,
): string[] {
  const start = timeToMin(openTime)
  const end = timeToMin(closeTime)
  const slots: string[] = []
  for (let t = start; t + duration <= end; t += interval) {
    slots.push(minToTime(t))
  }
  return slots
}

export function filterAvailableSlots(
  allSlots: string[],
  booked: { time: string; duration: number }[],
  duration: number,
  dateISO: string,
): string[] {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return allSlots.filter(time => {
    if (dateISO === today && timeToMin(time) <= nowMin) return false
    if (dateISO < today) return false
    const bookedWithId = booked.map(b => ({ id: '', ...b }))
    return !hasSameDayConflict(bookedWithId, time, duration)
  })
}
