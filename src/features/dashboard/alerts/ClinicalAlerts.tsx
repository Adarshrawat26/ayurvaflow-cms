/**
 * ClinicalAlerts — Dashboard alert engine
 * Inspired by OpenEMR clinical decision rules + OHC Care notification pattern
 *
 * Computes 3 types of live alerts from Redux state:
 * 1. Follow-up overdue (patient hasn't returned within their prescribed window)
 * 2. Treatment plan ending soon (>85% complete, end date within 7 days)
 * 3. Invoice unpaid 30+ days (revenue leakage alert)
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, IndianRupee, Leaf, X, ChevronRight } from 'lucide-react'
import { useAppSelector } from '../../../store/hooks'
import {
  selectConsultations,
  selectPatients,
  selectActiveTreatments,
  selectInvoices,
} from '../../../store/selectors'
import type { Page } from '../../../types/entities'

interface Alert {
  id: string
  type: 'followup' | 'treatment' | 'invoice'
  severity: 'warning' | 'error' | 'info'
  message: string
  subtext: string
  page: Page
  count?: number
}

interface Props {
  onNavigate: (page: Page) => void
  onDismiss?: (id: string) => void
  dismissed?: string[]
}

const SEVERITY_STYLES = {
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600 bg-amber-100',
    text: 'text-amber-900',
    sub: 'text-amber-700',
    btn: 'text-amber-700 hover:text-amber-900',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600 bg-red-100',
    text: 'text-red-900',
    sub: 'text-red-700',
    btn: 'text-red-700 hover:text-red-900',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600 bg-blue-100',
    text: 'text-blue-900',
    sub: 'text-blue-700',
    btn: 'text-blue-700 hover:text-blue-900',
  },
}

const FOLLOWUP_WINDOWS: Record<string, number> = {
  '1 week': 7,
  '2 weeks': 14,
  '4 weeks': 28,
  '6 weeks': 42,
  '3 months': 90,
}

export default function ClinicalAlerts({ onNavigate, onDismiss, dismissed = [] }: Props) {
  const consultations = useAppSelector(selectConsultations)
  const patients = useAppSelector(selectPatients)
  const treatments = useAppSelector(selectActiveTreatments)
  const invoices = useAppSelector(selectInvoices)

  const alerts = useMemo<Alert[]>(() => {
    const now = Date.now()
    const DAY_MS = 86400000
    const result: Alert[] = []

    // ── 1. Follow-up overdue ─────────────────────────────────────────────────
    // Group latest consultation per patient
    const latestByPatient = new Map<string, { createdAt: string; followUp: string; patient: string }>()
    for (const c of consultations) {
      const existing = latestByPatient.get(c.patientId)
      if (!existing || c.createdAt > existing.createdAt) {
        latestByPatient.set(c.patientId, {
          createdAt: c.createdAt,
          followUp: c.followUp,
          patient: c.patient,
        })
      }
    }

    const overdue: string[] = []
    for (const [, data] of latestByPatient) {
      const windowDays = FOLLOWUP_WINDOWS[data.followUp] ?? 28
      const visitAge = (now - new Date(data.createdAt).getTime()) / DAY_MS
      if (visitAge > windowDays + 7) {
        // 7-day grace period
        overdue.push(data.patient)
      }
    }
    if (overdue.length > 0) {
      result.push({
        id: 'followup-overdue',
        type: 'followup',
        severity: overdue.length > 3 ? 'error' : 'warning',
        message: `${overdue.length} patient${overdue.length > 1 ? 's' : ''} overdue for follow-up`,
        subtext: overdue.slice(0, 2).join(', ') + (overdue.length > 2 ? ` +${overdue.length - 2} more` : ''),
        page: 'patients',
        count: overdue.length,
      })
    }

    // ── 2. Treatment ending soon ─────────────────────────────────────────────
    const endingSoon = treatments.filter(t => {
      const pct = t.completedSessions / t.totalSessions
      const remaining = t.totalSessions - t.completedSessions
      return pct >= 0.75 && remaining <= 3
    })
    if (endingSoon.length > 0) {
      result.push({
        id: 'treatment-ending',
        type: 'treatment',
        severity: 'info',
        message: `${endingSoon.length} treatment programme${endingSoon.length > 1 ? 's' : ''} ending soon`,
        subtext: endingSoon.map(t => `${t.patient} (${t.totalSessions - t.completedSessions} sessions left)`).slice(0, 2).join(' · '),
        page: 'treatments',
        count: endingSoon.length,
      })
    }

    // ── 3. Unpaid invoices 30+ days ──────────────────────────────────────────
    const staleInvoices = invoices.filter(inv => {
      if (inv.status === 'paid') return false
      const age = (now - new Date(inv.date).getTime()) / DAY_MS
      return age > 30
    })
    if (staleInvoices.length > 0) {
      const totalOwed = staleInvoices.reduce((sum, inv) => sum + (inv.total - inv.paid), 0)
      result.push({
        id: 'invoice-stale',
        type: 'invoice',
        severity: 'error',
        message: `${staleInvoices.length} unpaid invoice${staleInvoices.length > 1 ? 's' : ''} over 30 days old`,
        subtext: `₹${totalOwed.toLocaleString('en-IN')} outstanding · oldest: ${staleInvoices[0]?.patient ?? ''}`,
        page: 'billing',
        count: staleInvoices.length,
      })
    }

    return result.filter(a => !dismissed.includes(a.id))
  }, [consultations, patients, treatments, invoices, dismissed])

  if (alerts.length === 0) return null

  const AlertIcon = {
    followup: Clock,
    treatment: Leaf,
    invoice: IndianRupee,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 px-0.5">
        <AlertTriangle size={13} className="text-amber-500" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Clinical Alerts
        </span>
        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
          {alerts.length}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity]
          const Icon = AlertIcon[alert.type]
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${style.bg} group`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}>
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${style.text}`}>{alert.message}</p>
                <p className={`text-[11px] mt-0.5 leading-relaxed ${style.sub}`}>{alert.subtext}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onNavigate(alert.page)}
                  className={`flex items-center gap-0.5 text-[10px] font-semibold ${style.btn} transition-colors`}
                >
                  View <ChevronRight size={10} />
                </button>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className={`ml-1 opacity-0 group-hover:opacity-100 transition-opacity ${style.btn}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
