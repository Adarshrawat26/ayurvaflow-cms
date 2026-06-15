import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, ClipboardList, FileText, HeartPulse, LogOut, Receipt } from 'lucide-react'
import type { User } from '@/types/entities'
import PatientDocuments from '../components/PatientDocuments'
import PortalBooking from '../components/portal/PortalBooking'
import PortalRegistrationOnboarding from '../components/portal/PortalRegistrationOnboarding'
import { api, ApiError } from '@/lib/api'
import { formatShortDate } from '@/lib/dates'
import { EmptyState, initials } from '@/lib/ui'
import type { Appointment, Invoice, Treatment } from '@/types/entities'
import type { PatientRegistrationRecord } from '@/types/registration'

type PortalPage = 'appointments' | 'treatments' | 'billing' | 'documents'

interface Props {
  user: User
  token: string
  onLogout: () => void
}

export default function PatientPortal({ user, token, onLogout }: Props) {
  const [page, setPage] = useState<PortalPage>('appointments')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    patient: { name: string; phone: string; email: string; balance: number }
    clinic: string
    isRegistered: boolean
    clinicContact: { phone: string; email: string; address: string }
    registration: PatientRegistrationRecord | null
    careDoctor: string | null
  } | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [treatments, setTreatments] = useState<Treatment[] | null>(null)

  const firstName = (profile?.patient.name ?? user.name).split(' ')[0]

  const loadCore = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, appts] = await Promise.all([
        api.portalMe(token),
        api.portalAppointments(token),
      ])
      setProfile(me)
      setAppointments(appts)
      if (me.isRegistered) {
        api.portalTreatments(token).then(setTreatments).catch(() => setTreatments([]))
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load your records')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  useEffect(() => {
    if (page === 'billing' && invoices === null) {
      api.portalInvoices(token).then(setInvoices).catch(() => setInvoices([]))
    }
    if (page === 'treatments' && treatments === null) {
      api.portalTreatments(token).then(setTreatments).catch(() => setTreatments([]))
    }
  }, [page, token, invoices, treatments])

  const isRegistered = profile?.isRegistered ?? !!profile?.registration
  const activeTreatments = useMemo(
    () => (treatments ?? []).filter(t => t.status === 'active'),
    [treatments],
  )
  const balanceDue = profile?.patient.balance ?? 0
  const invoiceDue = useMemo(
    () => (invoices ?? []).reduce((sum, i) => sum + Math.max(0, i.total - i.paid), 0),
    [invoices],
  )
  const totalDue = invoiceDue || balanceDue

  const nav = useMemo(() => {
    if (!isRegistered) {
      return [
        { id: 'appointments' as PortalPage, label: 'One-Time Registration', shortLabel: 'Register', Icon: ClipboardList },
        { id: 'documents' as PortalPage, label: 'My documents', shortLabel: 'Docs', Icon: FileText },
      ]
    }
    const items = [{ id: 'appointments' as PortalPage, label: 'My calendar', shortLabel: 'Calendar', Icon: CalendarClock }]
    if (activeTreatments.length > 0) {
      items.push({ id: 'treatments', label: 'My care', shortLabel: 'Care', Icon: HeartPulse })
    }
    if (balanceDue > 0) {
      items.push({ id: 'billing', label: 'My balance', shortLabel: 'Balance', Icon: Receipt })
    }
    items.push({ id: 'documents', label: 'My documents', shortLabel: 'Docs', Icon: FileText })
    return items
  }, [isRegistered, activeTreatments.length, balanceDue])

  const reload = () => {
    loadCore()
    if (invoices !== null) api.portalInvoices(token).then(setInvoices)
    if (treatments !== null) api.portalTreatments(token).then(setTreatments)
  }

  const showNav = nav.length > 1

  const navButton = (
    variant: 'top' | 'bottom',
    { id, label, shortLabel, Icon }: (typeof nav)[number],
  ) => {
    const active = page === id
    if (variant === 'bottom') {
      return (
        <button
          key={id}
          type="button"
          onClick={() => setPage(id)}
          aria-current={active ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
            active ? 'text-[#1B4332]' : 'text-gray-400'
          }`}
        >
          <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
          <span>{shortLabel}</span>
        </button>
      )
    }
    return (
      <button
        key={id}
        type="button"
        onClick={() => setPage(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
          active ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <Icon size={14} />
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials(profile?.patient.name ?? user.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">Hi, {firstName}</h1>
              {isRegistered && profile?.registration && (
                <p className="text-[10px] text-gray-400 truncate">{profile.registration.regNumber}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-medium shrink-0"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Desktop / tablet — top tabs only (hidden on phones) */}
      {showNav && (
        <div className="hidden md:block bg-white border-b border-gray-100 shrink-0">
          <nav className="max-w-lg mx-auto flex overflow-x-auto px-2 gap-1" aria-label="Your portal">
            {nav.map(item => navButton('top', item))}
          </nav>
        </div>
      )}

      <main className={`flex-1 p-4 md:p-6 max-w-lg w-full mx-auto min-w-0 ${showNav ? 'pb-24 md:pb-8' : 'pb-8'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button type="button" className="btn-primary text-sm" onClick={loadCore}>Try again</button>
          </div>
        ) : profile && (
          <>
            {page === 'appointments' && (
              isRegistered ? (
                <PortalBooking
                  token={token}
                  patientName={profile.patient.name}
                  careDoctor={profile.careDoctor}
                  appointments={appointments}
                  onBooked={reload}
                />
              ) : (
                <PortalRegistrationOnboarding
                  patientName={profile.patient.name}
                  clinic={profile.clinic}
                  contact={profile.clinicContact}
                  onOpenDocuments={() => setPage('documents')}
                />
              )
            )}

            {page === 'treatments' && (
              <div className="space-y-3">
                {activeTreatments.length === 0 ? (
                  <EmptyState icon={HeartPulse} title="No active care" description="Your treatment progress will appear here." />
                ) : (
                  activeTreatments.map(t => {
                    const pct = Math.round((t.completedSessions / t.totalSessions) * 100)
                    return (
                      <div key={t.id} className="card p-4">
                        <div className="font-medium text-gray-900">{t.type}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t.completedSessions} of {t.totalSessions} sessions · {pct}%
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                          <div className="h-full rounded-full bg-[#52B788]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {page === 'billing' && (
              <div className="space-y-3">
                {invoices === null ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
                  </div>
                ) : totalDue > 0 ? (
                  <>
                    <div className="card p-4 border-amber-200 bg-amber-50 text-center">
                      <div className="text-xs text-amber-800">Your balance due</div>
                      <div className="text-2xl font-bold text-amber-900 mt-1">₹{totalDue.toLocaleString('en-IN')}</div>
                    </div>
                    {invoices.filter(i => i.total - i.paid > 0).map(inv => (
                      <div key={inv.id} className="card p-4 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">{formatShortDate(inv.date)}</span>
                          <span className="font-medium text-red-600">₹{(inv.total - inv.paid).toLocaleString('en-IN')} due</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <EmptyState icon={Receipt} title="All clear" description="You have no outstanding balance." />
                )}
              </div>
            )}

            {page === 'documents' && (
              <PatientDocuments token={token} mode="portal" />
            )}
          </>
        )}
      </main>

      {/* Mobile — bottom tabs only (hidden on md+) */}
      {showNav && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200"
          aria-label="Your portal"
        >
          <div className="max-w-lg mx-auto flex px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {nav.map(item => navButton('bottom', item))}
          </div>
        </nav>
      )}
    </div>
  )
}
