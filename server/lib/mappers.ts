import type {
  AppointmentStatus,
  Gender,
  InvoiceStatus,
  PatientStatus,
  TreatmentStatus,
  UserRole,
} from '@prisma/client'

export function toRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    SUPER_ADMIN: 'admin',
    ADMIN: 'admin',
    RECEPTIONIST: 'receptionist',
    DOCTOR: 'doctor',
    THERAPIST: 'therapist',
  }
  return map[role]
}

export function fromRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    admin: 'ADMIN',
    receptionist: 'RECEPTIONIST',
    doctor: 'DOCTOR',
    therapist: 'THERAPIST',
  }
  return map[role] ?? 'RECEPTIONIST'
}

export function toApptStatus(s: AppointmentStatus): string {
  return s.toLowerCase() as string
}

export function fromApptStatus(s: string): AppointmentStatus {
  const map: Record<string, AppointmentStatus> = {
    scheduled: 'SCHEDULED',
    arrived: 'ARRIVED',
    in_progress: 'IN_PROGRESS',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    no_show: 'NO_SHOW',
  }
  return map[s] ?? 'SCHEDULED'
}

export function toPatientStatus(s: PatientStatus): string {
  return s.toLowerCase()
}

export function fromPatientStatus(s: string): PatientStatus {
  const map: Record<string, PatientStatus> = {
    active: 'ACTIVE',
    completed: 'COMPLETED',
    inactive: 'INACTIVE',
  }
  return map[s] ?? 'ACTIVE'
}

export function toTreatmentStatus(s: TreatmentStatus): string {
  return s.toLowerCase() as 'active' | 'completed'
}

export function toInvoiceStatus(s: InvoiceStatus): string {
  return s.toLowerCase() as 'paid' | 'partial' | 'unpaid'
}

export function fromInvoiceStatus(total: number, paid: number): InvoiceStatus {
  if (paid >= total) return 'PAID'
  if (paid > 0) return 'PARTIAL'
  return 'UNPAID'
}

export function toGender(g: Gender): 'M' | 'F' {
  return g === 'F' ? 'F' : 'M'
}

export function fromGender(g: string): Gender {
  return g === 'F' ? 'F' : 'M'
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return ''
  return d.toISOString().split('T')[0]
}

export function num(n: { toNumber?: () => number } | number | null | undefined): number {
  if (n == null) return 0
  if (typeof n === 'number') return n
  if (typeof n === 'object' && 'toNumber' in n && n.toNumber) return n.toNumber()
  return Number(n)
}
