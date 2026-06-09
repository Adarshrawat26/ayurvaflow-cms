import type {
  Appointment,
  ConsultationRecord,
  Invoice,
  Patient,
  StaffMember,
  Treatment,
} from '@/types/entities'
import type { PatientRegistrationRecord } from '@/types/registration'
import { toISODate } from '@/lib/dates'

export interface ClinicDataInput {
  patients: Patient[]
  appointments: Appointment[]
  treatments: Treatment[]
  invoices: Invoice[]
  consultations: ConsultationRecord[]
  registrations: PatientRegistrationRecord[]
  staff: StaffMember[]
}

const SKIP = new Set(['cancelled', 'no_show'])

const toMin = (time: string, off = 0) => {
  const [h, m] = time.split(':').map(Number)
  return (h - off) * 60 + m
}

function groupBy<T>(items: T[], key: (i: T) => string) {
  const m = new Map<string, T[]>()
  for (const i of items) {
    const k = key(i)
    const b = m.get(k)
    if (b) b.push(i)
    else m.set(k, [i])
  }
  return m
}

function indexBy<T>(items: T[], key: (i: T) => string) {
  const m = new Map<string, T>()
  for (const i of items) m.set(key(i), i)
  return m
}

/** Prefix → ids (compact typeahead index). */
function prefixIndex<T extends { id: string }>(items: T[], tokens: (t: T) => string[]) {
  const m = new Map<string, Set<string>>()
  const add = (pfx: string, id: string) => {
    if (!pfx) return
    const s = m.get(pfx) ?? new Set()
    s.add(id)
    m.set(pfx, s)
  }
  for (const item of items) {
    for (const raw of tokens(item)) {
      const t = raw.toLowerCase().trim()
      for (let i = 1; i <= t.length; i++) add(t.slice(0, i), item.id)
    }
  }
  return m
}

function sortDesc<T>(items: T[], key: (i: T) => string) {
  return [...items].sort((a, b) => key(b).localeCompare(key(a)))
}

function layoutOverlapping<T extends { start: number; end: number }>(items: T[]) {
  if (!items.length) return [] as (T & { col: number; cols: number })[]
  const groups: T[][] = []
  for (const item of [...items].sort((a, b) => a.start - b.start)) {
    const g = groups.find(grp => grp.some(x => item.start < x.end && item.end > x.start))
    if (g) g.push(item)
    else groups.push([item])
  }
  return groups.flatMap(g => g.map((item, col) => ({ ...item, col, cols: g.length })))
}

export class ClinicDataIndex {
  readonly patientsById: Map<string, Patient>
  readonly registrationsByPatientId: Map<string, PatientRegistrationRecord>
  readonly consultationsByAppointmentId: Map<string, ConsultationRecord>
  readonly appointmentsByPatientId: Map<string, Appointment[]>
  readonly treatmentsByPatientId: Map<string, Treatment[]>
  readonly invoicesByPatientId: Map<string, Invoice[]>
  readonly consultationsByPatientId: Map<string, ConsultationRecord[]>
  readonly byDate: Map<string, Appointment[]>
  readonly appointmentDates: Set<string>
  readonly intervals: Map<string, { id: string; start: number; end: number }[]>
  readonly todayKey = toISODate()

  private patientPrefix: Map<string, Set<string>>
  private staffPrefix: Map<string, Set<string>>
  private staffById: Map<string, StaffMember>

  private constructor(d: ClinicDataInput) {
    this.patientsById = indexBy(d.patients, p => p.id)
    this.registrationsByPatientId = indexBy(d.registrations, r => r.patientId)
    this.consultationsByAppointmentId = indexBy(
      d.consultations.filter(c => c.appointmentId),
      c => c.appointmentId,
    )
    this.appointmentsByPatientId = groupBy(d.appointments, a => a.patientId)
    this.treatmentsByPatientId = groupBy(d.treatments, t => t.patientId)
    this.invoicesByPatientId = groupBy(d.invoices, i => i.patientId)
    this.consultationsByPatientId = groupBy(d.consultations, c => c.patientId)
    this.staffById = indexBy(d.staff, s => s.id)

    this.byDate = new Map()
    this.appointmentDates = new Set()
    this.intervals = new Map()
    for (const a of d.appointments) {
      this.appointmentDates.add(a.date)
      const list = this.byDate.get(a.date) ?? []
      list.push(a)
      this.byDate.set(a.date, list)
      if (SKIP.has(a.status)) continue
      const key = `${a.doctor}\0${a.date}`
      const iv = this.intervals.get(key) ?? []
      const start = toMin(a.time)
      iv.push({ id: a.id, start, end: start + a.duration })
      iv.sort((x, y) => x.start - y.start)
      this.intervals.set(key, iv)
    }
    for (const [date, list] of this.byDate) {
      this.byDate.set(date, [...list].sort((a, b) => a.time.localeCompare(b.time)))
    }

    this.patientPrefix = prefixIndex(d.patients, p =>
      [p.id, p.name, p.phone, p.email, p.purpose, p.city, ...p.name.split(/\s+/)],
    )
    this.staffPrefix = prefixIndex(d.staff, s =>
      [s.id, s.name, s.email, s.phone, s.specialization, ...s.name.split(/\s+/)],
    )
  }

  static build(input: ClinicDataInput) {
    return new ClinicDataIndex(input)
  }

  getPatient = (id: string) => this.patientsById.get(id)
  getRegistration = (id: string) => this.registrationsByPatientId.get(id)
  getConsultationForAppointment = (id: string) => this.consultationsByAppointmentId.get(id)
  getTodayAppointments = () => this.byDate.get(this.todayKey) ?? []

  getConsultationQueue = () =>
    this.getTodayAppointments().filter(a => !SKIP.has(a.status) && a.status !== 'completed')

  searchPatients(query: string) {
    const q = query.trim().toLowerCase()
    if (!q) return [...this.patientsById.values()]
    const ids = this.patientPrefix.get(q)
    if (ids) return [...ids].map(id => this.patientsById.get(id)!).filter(Boolean)
    return [...this.patientsById.values()].filter(p =>
      `${p.name} ${p.phone} ${p.id} ${p.email} ${p.purpose}`.toLowerCase().includes(q),
    )
  }

  searchStaff(query: string) {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const ids = this.staffPrefix.get(q) ?? new Set()
    return [...ids].map(id => this.staffById.get(id)!).filter(Boolean)
  }

  getPatientHistory(patientId: string) {
    const apptKey = (a: Appointment) => `${a.date}T${a.time}`
    return {
      appointments: sortDesc(this.appointmentsByPatientId.get(patientId) ?? [], apptKey),
      consultations: sortDesc(this.consultationsByPatientId.get(patientId) ?? [], c => c.createdAt),
      treatments: sortDesc(this.treatmentsByPatientId.get(patientId) ?? [], t => t.startDate),
      invoices: sortDesc(this.invoicesByPatientId.get(patientId) ?? [], i => i.date),
    }
  }

  getDoctorMonthlyPatientCounts(doctors: { name: string }[], monthKey: string) {
    const counts = new Map(doctors.map(d => [d.name, 0]))
    const unique = new Map<string, Set<string>>()
    for (const [date, appts] of this.byDate) {
      if (!date.startsWith(monthKey)) continue
      for (const a of appts) {
        if (!counts.has(a.doctor)) continue
        const set = unique.get(a.doctor) ?? new Set()
        set.add(a.patientId)
        unique.set(a.doctor, set)
      }
    }
    for (const [doc, set] of unique) counts.set(doc, set.size)
    return counts
  }

  hasAppointmentConflict(date: string, time: string, duration: number, doctor: string, excludeId?: string, dayStart = 8) {
    const start = toMin(time, dayStart)
    const end = start + duration
    const list = this.intervals.get(`${doctor}\0${date}`)
    if (!list) return false
    for (const iv of list) {
      if (excludeId && iv.id === excludeId) continue
      if (start < iv.end && end > iv.start) return true
      if (iv.start >= end) break
    }
    return false
  }

  layoutDayAppointments(appts: Appointment[], dayStart = 8) {
    return layoutOverlapping(
      appts.map(a => ({
        ...a,
        start: toMin(a.time, dayStart),
        end: toMin(a.time, dayStart) + a.duration,
      })),
    )
  }

  filterAppointments(opts: { dates?: Set<string>; date?: string; doctor?: string; status?: string }) {
    const pool = opts.date
      ? this.byDate.get(opts.date) ?? []
      : opts.dates
        ? [...opts.dates].flatMap(d => this.byDate.get(d) ?? [])
        : [...this.byDate.values()].flat()
    return pool.filter(a =>
      (!opts.doctor || opts.doctor === 'all' || a.doctor === opts.doctor) &&
      (!opts.status || opts.status === 'all' || a.status === opts.status),
    )
  }
}
