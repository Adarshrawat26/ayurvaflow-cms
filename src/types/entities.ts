export type Role = 'admin' | 'receptionist' | 'doctor' | 'therapist' | 'patient'
export type StaffRole = Exclude<Role, 'patient'>
export type Page = 'dashboard' | 'patients' | 'appointments' | 'treatments' | 'consultations' | 'billing' | 'reports' | 'settings'
export type { ConsultationRecord as Consultation }

export interface User {
  name: string
  role: Role
  clinic: string
  patientId?: string
  email?: string
}

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  specialization: string
  experience: number
  phone: string
  email: string
  status: 'active' | 'inactive'
  joinDate: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  phone: string
  email: string
  city: string
  referral: string
  purpose: string
  prakriti: string
  status: 'active' | 'completed' | 'inactive'
  lastVisit: string
  balance: number
  occupation: string
  nationality: string
  /** ISO timestamp when the patient record was created — used for acquisition reports */
  createdAt: string
}

export type AppointmentStatus = 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'

export interface Appointment {
  id: string
  patientId: string
  patient: string
  doctor: string
  date: string
  time: string
  type: string
  status: AppointmentStatus
  duration: number
}

export interface Treatment {
  id: string
  patientId: string
  patient: string
  type: string
  condition: string
  totalSessions: number
  completedSessions: number
  startDate: string
  endDate: string
  doctor: string
  status: 'active' | 'completed'
  cost: number
}

export interface InvoiceItem {
  desc: string
  qty: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  patientId: string
  patient: string
  date: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  paid: number
  status: 'paid' | 'partial' | 'unpaid'
}

export interface ConsultationRecord {
  id: string
  appointmentId: string
  patientId: string
  patient: string
  doctor: string
  // ── S — Subjective ─────────────────────────────────────
  complaints: string
  duration: string
  history: string
  allergies: string
  // ── O — Objective (Ashtavidha Pariksha) ───────────────
  pulse: string
  tongue: string
  eyes: string
  skin: string
  // ── O — Structured Vitals (numeric) ───────────────────
  pulse_rate?: string
  bp_systolic?: string
  bp_diastolic?: string
  weight_kg?: string
  // ── A — Assessment ────────────────────────────────────
  prakriti: string
  vikruti: string
  condition: string
  // ── P — Plan ──────────────────────────────────────────
  therapy: string
  sessions: string
  medicines: string
  diet: string
  lifestyle: string
  followUp: string
  createdAt: string
}

export interface ConsultationForm {
  // S — Subjective
  complaints: string
  duration: string
  history: string
  allergies: string
  // O — Objective (Ashtavidha Pariksha)
  pulse: string
  tongue: string
  eyes: string
  skin: string
  // O — Structured Vitals
  pulse_rate: string
  bp_systolic: string
  bp_diastolic: string
  weight_kg: string
  // A — Assessment
  prakriti: string
  vikruti: string
  condition: string
  // P — Plan
  therapy: string
  sessions: string
  medicines: string
  diet: string
  lifestyle: string
  followUp: string
}
