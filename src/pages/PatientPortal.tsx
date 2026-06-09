import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  CalendarX,
  ChevronRight,
  FileText,
  Gauge,
  HeartPulse,
  LogOut,
  Receipt,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { User } from '@/types/entities'
import Logo from '../components/Logo'
import PatientDocuments from '../components/PatientDocuments'
import { api, ApiError } from '@/lib/api'
import { formatShortDate } from '@/lib/dates'
import type { Appointment, Invoice, Treatment } from '@/types/entities'
import type { PatientRegistrationRecord } from '@/types/registration'

type PortalPage = 'dashboard' | 'appointments' | 'treatments' | 'billing' | 'documents'

interface Props {
  user: User
  token: string
  onLogout: () => void
}

const NAV: { id: PortalPage; label: string; shortLabel: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Overview', shortLabel: 'Home', Icon: Gauge },
  { id: 'appointments', label: 'Appointments', shortLabel: 'Appts', Icon: CalendarClock },
  { id: 'treatments', label: 'Treatments', shortLabel: 'Care', Icon: HeartPulse },
  { id: 'billing', label: 'Billing', shortLabel: 'Bills', Icon: Receipt },
  { id: 'documents', label: 'Documents', shortLabel: 'Docs', Icon: FileText },
]

const APPT_STATUS: Record<string, string> = {
  scheduled: 'Scheduled',
  arrived: 'Arrived',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  arrived: 'bg-amber-50 text-amber-700 border-amber-100',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
  completed: 'bg-green-50 text-green-700 border-green-100',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  no_show: 'bg-red-50 text-red-700 border-red-100',
  paid: 'bg-green-50 text-green-700 border-green-100',
  partial: 'bg-amber-50 text-amber-700 border-amber-100',
  unpaid: 'bg-red-50 text-red-700 border-red-100',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="card p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{description}</p>
    </div>
  )
}

export default function PatientPortal({ user, token, onLogout }: Props) {
  const [page, setPage] = useState<PortalPage>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    patient: { name: string; phone: string; email: string; balance: number; prakriti: string; purpose: string }
    clinic: string
    registration: PatientRegistrationRecord | null
  } | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, appts, invs, treats] = await Promise.all([
        api.portalMe(token),
        api.portalAppointments(token),
        api.portalInvoices(token),
        api.portalTreatments(token),
      ])
      setProfile(me)
      setAppointments(appts)
      setInvoices(invs)
      setTreatments(treats)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load your records')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const upcoming = useMemo(
    () => appointments.filter(a => a.status === 'scheduled' || a.status === 'arrived'),
    [appointments],
  )
  const nextAppt = useMemo(() => {
    return [...upcoming]
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  }, [upcoming])
  const activeTreatments = useMemo(
    () => treatments.filter(t => t.status === 'active'),
    [treatments],
  )
  const totalDue = useMemo(
    () => invoices.reduce((sum, i) => sum + Math.max(0, i.total - i.paid), 0),
    [invoices],
  )

  const pageTitle = NAV.find(n => n.id === page)?.label ?? 'Portal'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-8 h-auto shrink-0 hidden sm:block" />
            <div className="w-9 h-9 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0 sm:hidden">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{pageTitle}</h1>
              <p className="text-[10px] text-gray-500 truncate">{user.clinic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:block text-right mr-1">
              <div className="text-xs font-medium text-gray-900">{user.name}</div>
              <div className="text-[10px] text-gray-500">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-medium"
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl w-full mx-auto min-w-0">
        {/* Desktop sidebar */}
        <nav className="hidden lg:flex flex-col w-52 shrink-0 border-r border-gray-200 bg-white p-3 gap-0.5" aria-label="Patient portal navigation">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPage(id)}
              aria-current={page === id ? 'page' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                page === id ? 'bg-[#1B4332] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500">Loading your records…</p>
            </div>
          ) : error ? (
            <div className="card p-8 text-center max-w-md mx-auto">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button type="button" className="btn-primary text-sm" onClick={load}>Try again</button>
            </div>
          ) : (
            <>
              {page === 'dashboard' && profile && (
                <div className="space-y-4">
                  <div className="card p-5 bg-gradient-to-br from-[#1B4332] to-[#2d6a4f] text-white">
                    <p className="text-xs text-white/70 uppercase tracking-wide font-medium">Welcome back</p>
                    <h2 className="text-xl font-semibold mt-1">{profile.patient.name.split(' ')[0]}</h2>
                    <p className="text-sm text-white/80 mt-1">{profile.clinic}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPage('appointments')}
                      className="card p-4 text-left hover:border-[#1B4332]/30 transition-colors"
                    >
                      <CalendarClock size={16} className="text-[#1B4332] mb-2" />
                      <div className="text-xs text-gray-500">Upcoming</div>
                      <div className="text-xl font-bold text-gray-900">{upcoming.length}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage('treatments')}
                      className="card p-4 text-left hover:border-[#1B4332]/30 transition-colors"
                    >
                      <HeartPulse size={16} className="text-[#1B4332] mb-2" />
                      <div className="text-xs text-gray-500">Active care</div>
                      <div className="text-xl font-bold text-gray-900">{activeTreatments.length}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage('billing')}
                      className="card p-4 text-left hover:border-[#1B4332]/30 transition-colors col-span-2 sm:col-span-1"
                    >
                      <Wallet size={16} className="text-[#1B4332] mb-2" />
                      <div className="text-xs text-gray-500">Balance due</div>
                      <div className="text-xl font-bold text-gray-900">
                        {totalDue ? `₹${totalDue.toLocaleString('en-IN')}` : 'Nil'}
                      </div>
                    </button>
                  </div>

                  {nextAppt && (
                    <button
                      type="button"
                      onClick={() => setPage('appointments')}
                      className="card p-4 w-full text-left hover:border-[#1B4332]/30 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 flex items-center justify-center shrink-0">
                        <CalendarClock size={18} className="text-[#1B4332]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wide text-[#1B4332] font-semibold">Next visit</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{nextAppt.type}</div>
                        <div className="text-xs text-gray-500">
                          {formatShortDate(nextAppt.date)} · {nextAppt.time} · {nextAppt.doctor}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </button>
                  )}

                  {activeTreatments.length > 0 && (
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Treatment progress</h3>
                        <button type="button" onClick={() => setPage('treatments')} className="text-xs text-[#1B4332] font-medium">
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {activeTreatments.slice(0, 2).map(t => {
                          const pct = Math.round((t.completedSessions / t.totalSessions) * 100)
                          return (
                            <div key={t.id}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-800">{t.type}</span>
                                <span className="text-gray-500">{t.completedSessions}/{t.totalSessions} sessions</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#52B788] transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="card p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserRound size={16} className="text-[#1B4332]" /> Your profile
                    </h3>
                    <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      {[
                        ['Phone', profile.patient.phone],
                        ['Email', profile.patient.email || '—'],
                        ['Prakriti', profile.patient.prakriti || '—'],
                        ['Purpose', profile.patient.purpose || '—'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs text-gray-500">{k}</dt>
                          <dd className="text-gray-900 font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {profile.registration && (
                      <p className="text-xs text-[#1B4332] mt-4 bg-[#1B4332]/5 rounded-lg px-3 py-2 border border-[#1B4332]/10">
                        Registration: <strong>{profile.registration.regNumber}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {page === 'appointments' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} on record
                  </p>
                  {appointments.length === 0 ? (
                    <EmptyState
                      icon={CalendarX}
                      title="No appointments yet"
                      description="When the centre books a visit for you, it will appear here."
                    />
                  ) : (
                    appointments.map(a => (
                      <div key={a.id} className="card p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <CalendarClock size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="font-medium text-gray-900">{a.type}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_STYLE[a.status] ?? 'bg-gray-100'}`}>
                              {APPT_STATUS[a.status] ?? a.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatShortDate(a.date)} · {a.time}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{a.doctor} · {a.duration} min</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {page === 'treatments' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {treatments.length} treatment programme{treatments.length !== 1 ? 's' : ''}
                  </p>
                  {treatments.length === 0 ? (
                    <EmptyState
                      icon={HeartPulse}
                      title="No treatment programmes"
                      description="Your prescribed Ayurveda therapies and session progress will show here."
                    />
                  ) : (
                    treatments.map(t => {
                      const pct = Math.round((t.completedSessions / t.totalSessions) * 100)
                      return (
                        <div key={t.id} className="card p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="font-medium text-gray-900">{t.type}</div>
                              <div className="text-xs text-gray-500">{t.condition}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize ${STATUS_STYLE[t.status] ?? ''}`}>
                              {t.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {t.doctor} · {formatShortDate(t.startDate)}
                            {t.endDate ? ` – ${formatShortDate(t.endDate)}` : ''}
                          </div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{t.completedSessions} of {t.totalSessions} sessions</span>
                            <span className="font-semibold text-[#1B4332]">{pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#52B788]" style={{ width: `${pct}%` }} />
                          </div>
                          {t.cost > 0 && (
                            <div className="text-xs text-gray-400 mt-2">Programme cost: ₹{t.cost.toLocaleString('en-IN')}</div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {page === 'billing' && (
                <div className="space-y-3">
                  {totalDue > 0 && (
                    <div className="card p-4 border-amber-200 bg-amber-50 flex items-center gap-3">
                      <Wallet size={18} className="text-amber-600 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-amber-800">Outstanding balance</div>
                        <div className="text-lg font-bold text-amber-900">₹{totalDue.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mb-1">
                    {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                  </p>
                  {invoices.length === 0 ? (
                    <EmptyState
                      icon={Receipt}
                      title="No invoices yet"
                      description="Bills from your visits and treatment packages will appear here."
                    />
                  ) : (
                    invoices.map(inv => {
                      const due = inv.total - inv.paid
                      return (
                        <div key={inv.id} className="card p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="font-medium text-gray-900">{inv.id}</div>
                              <div className="text-xs text-gray-500">{formatShortDate(inv.date)}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize ${STATUS_STYLE[inv.status] ?? ''}`}>
                              {inv.status}
                            </span>
                          </div>
                          {inv.items?.length > 0 && (
                            <ul className="text-xs text-gray-500 space-y-1 mb-3 border-b border-gray-100 pb-3">
                              {inv.items.map((item, i) => (
                                <li key={i} className="flex justify-between gap-2">
                                  <span className="truncate">{item.desc}</span>
                                  <span className="shrink-0">₹{item.amount.toLocaleString('en-IN')}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="text-gray-600">Total <strong className="text-gray-900">₹{inv.total.toLocaleString('en-IN')}</strong></span>
                            <span className="text-emerald-600">Paid ₹{inv.paid.toLocaleString('en-IN')}</span>
                            {due > 0 && (
                              <span className="text-red-600 font-medium">Due ₹{due.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {page === 'documents' && (
                <div className="space-y-3 min-w-0">
                  <div>
                    <p className="text-xs text-gray-500">
                      Upload Aadhaar, PAN, prescriptions, and lab reports for your records.
                    </p>
                  </div>
                  <PatientDocuments token={token} mode="portal" />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30"
        aria-label="Patient portal navigation"
      >
        {NAV.map(({ id, shortLabel, Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPage(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors min-w-0 ${
                active ? 'text-[#1B4332]' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              {shortLabel}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
