/**
 * Audit Middleware — inspired by OpenEMR log.inc pattern + OHC Care Django signals
 *
 * Intercepts every Redux action whose type ends in /fulfilled and appends
 * a human-readable entry to the session audit log.
 *
 * Architecture: This is a frontend session log only.
 * Persistent DB-level audit (Prisma middleware → AuditLog table) is Phase 2.
 */

import type { Middleware } from '@reduxjs/toolkit'

export interface AuditEntry {
  id: string
  action: string
  user: string
  summary: string
  timestamp: string
  module: string
}

// In-memory session log (not persisted to Redux to keep store small)
let sessionLog: AuditEntry[] = []
const MAX_LOG_SIZE = 200

function buildSummary(type: string, payload: unknown): string {
  const p = payload as Record<string, unknown>

  if (type.includes('saveConsultation')) {
    return `Saved consultation for ${p?.patient ?? 'patient'}`
  }
  if (type.includes('createInvoice')) {
    return `Created invoice ${p?.id ?? ''} · ₹${(p?.total as number)?.toLocaleString('en-IN') ?? ''}`
  }
  if (type.includes('recordInvoicePayment')) {
    return `Recorded payment for invoice ${p?.id ?? ''}`
  }
  if (type.includes('registerPatient')) {
    const name = (p?.name as string) ?? (p?.personalInfo as Record<string, string>)?.firstName ?? 'patient'
    return `Registered new patient: ${name}`
  }
  if (type.includes('updatePatient')) {
    return `Updated patient record: ${p?.name ?? p?.id ?? ''}`
  }
  if (type.includes('createAppointment')) {
    return `Booked appointment for ${p?.patient ?? ''} at ${p?.time ?? ''}`
  }
  if (type.includes('updateAppointment')) {
    return `Updated appointment ${p?.id ?? ''} → status: ${p?.status ?? ''}`
  }
  if (type.includes('createTreatment') || type.includes('saveTreatment')) {
    return `Created treatment plan for ${p?.patient ?? ''}`
  }
  if (type.includes('updateSettings') || type.includes('saveClinic')) {
    return `Updated clinic settings`
  }
  if (type.includes('login')) {
    return `Logged in`
  }
  if (type.includes('logout')) {
    return `Logged out`
  }
  // Generic fallback
  const action = type.replace('/fulfilled', '').split('/').pop() ?? type
  return action.replace(/([A-Z])/g, ' $1').trim()
}

function getModule(type: string): string {
  if (type.includes('Consultation')) return 'Consultations'
  if (type.includes('Invoice') || type.includes('Billing') || type.includes('Payment')) return 'Billing'
  if (type.includes('Patient') || type.includes('register')) return 'Patients'
  if (type.includes('Appointment')) return 'Appointments'
  if (type.includes('Treatment')) return 'Treatments'
  if (type.includes('Settings') || type.includes('Clinic')) return 'Settings'
  if (type.includes('auth') || type.includes('login') || type.includes('logout')) return 'Auth'
  return 'System'
}

export const auditMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const actionObj = action as { type: string; payload?: unknown }

  if (typeof actionObj.type === 'string' && actionObj.type.endsWith('/fulfilled')) {
    const state = store.getState() as { auth?: { user?: { name?: string; role?: string } } }
    const user = state.auth?.user

    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action: actionObj.type,
      user: user?.name ?? 'System',
      summary: buildSummary(actionObj.type, actionObj.payload),
      timestamp: new Date().toISOString(),
      module: getModule(actionObj.type),
    }

    sessionLog = [entry, ...sessionLog].slice(0, MAX_LOG_SIZE)
  }

  return result
}

// Public API to read the audit log from anywhere
export function getAuditLog(): AuditEntry[] {
  return sessionLog
}

export function clearAuditLog(): void {
  sessionLog = []
}
