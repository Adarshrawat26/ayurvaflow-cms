const toMin = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function hasSameDayConflict(
  existing: { id: string; time: string; duration: number }[],
  time: string,
  duration: number,
  excludeId?: string,
) {
  const start = toMin(time)
  const end = start + duration
  for (const a of [...existing].sort((x, y) => toMin(x.time) - toMin(y.time))) {
    if (excludeId && a.id === excludeId) continue
    const as = toMin(a.time)
    if (start < as + a.duration && end > as) return true
    if (as >= end) break
  }
  return false
}
