import { useMemo, useState } from 'react'
import {
  ArrowLeft, X, Search, Loader2, Package, CheckCircle2, Plus,
} from 'lucide-react'
import type { Page } from '../App'
import type { Treatment } from '../types/entities'
import { TREATMENT_PACKAGES, type TreatmentPackage } from '../data/packages'
import { addDays, formatShortDate, toISODate } from '../lib/dates'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectActiveDoctors, selectClinicIndex, selectTreatments } from '../store/selectors'
import { createTreatmentApi, updateTreatmentApi } from '../store/thunks/apiThunks'

type ViewMode = 'treatments' | 'packages'

const emptyAssignForm = (pkg: TreatmentPackage) => ({
  patientId: '',
  doctor: '',
  condition: pkg.conditionHint,
  startDate: toISODate(),
  totalSessions: String(pkg.totalSessions),
  sessionsPreset: pkg.totalSessions === 1 ? '1' : String(pkg.totalSessions),
})

export default function Treatments(_props: { onNavigate: (p: Page) => void; user?: unknown }) {
  const dispatch = useAppDispatch()
  const treatments = useAppSelector(selectTreatments)
  const clinicIndex = useAppSelector(selectClinicIndex)
  const doctors = useAppSelector(selectActiveDoctors)

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [selected, setSelected] = useState<Treatment | null>(null)
  const [view, setView] = useState<ViewMode>('treatments')
  const [assignPkg, setAssignPkg] = useState<TreatmentPackage | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [markingSession, setMarkingSession] = useState(false)
  const [assignForm, setAssignForm] = useState(() => emptyAssignForm(TREATMENT_PACKAGES[0]))

  const filtered = filter === 'all' ? treatments : treatments.filter(t => t.status === filter)

  const filteredPatients = useMemo(
    () => clinicIndex.searchPatients(patientSearch),
    [clinicIndex, patientSearch],
  )

  const openAssign = (pkg: TreatmentPackage) => {
    setAssignPkg(pkg)
    setAssignForm(emptyAssignForm(pkg))
    setPatientSearch('')
    setFormErrors({})
  }

  const computeEndDate = (start: string, days: number) => addDays(start, Math.max(0, days - 1))

  const validateAssign = () => {
    const errors: Record<string, string> = {}
    if (!assignForm.patientId) errors.patientId = 'Select a patient'
    if (!assignForm.doctor) errors.doctor = 'Select a doctor'
    if (!assignForm.condition.trim()) errors.condition = 'Enter a condition or goal'
    if (!assignForm.startDate) errors.startDate = 'Pick a start date'
    const sessions = Number(assignForm.totalSessions)
    if (!sessions || sessions < 1) errors.totalSessions = 'At least 1 session required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAssign = async () => {
    if (!assignPkg || !validateAssign()) return
    const pkg = assignPkg
    const totalSessions = Number(assignForm.totalSessions)
    const durationDays = pkg.id === 'PKG006'
      ? totalSessions
      : pkg.durationDays

    setSubmitting(true)
    try {
      const created = await dispatch(createTreatmentApi({
        patientId: assignForm.patientId,
        type: pkg.name,
        condition: assignForm.condition.trim(),
        totalSessions,
        durationDays,
        startDate: assignForm.startDate,
        endDate: computeEndDate(assignForm.startDate, durationDays),
        doctor: assignForm.doctor,
        cost: pkg.id === 'PKG006' ? pkg.price * totalSessions : pkg.price,
      })).unwrap()
      setAssignPkg(null)
      setView('treatments')
      setSelected(created)
    } catch {
      // toast in thunk
    } finally {
      setSubmitting(false)
    }
  }

  const markSessionComplete = async (t: Treatment) => {
    if (t.completedSessions >= t.totalSessions) return
    setMarkingSession(true)
    try {
      const updated = await dispatch(updateTreatmentApi({ id: t.id, action: 'complete_session' })).unwrap()
      setSelected(updated)
    } finally {
      setMarkingSession(false)
    }
  }

  if (selected) {
    const pct = Math.round((selected.completedSessions / selected.totalSessions) * 100)
    const canMarkSession = selected.status === 'active' && selected.completedSessions < selected.totalSessions

    return (
      <div className="p-4 lg:p-6 w-full">
        <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to treatments
        </button>
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selected.patient}</h2>
              <p className="text-sm text-[#1B4332] font-medium">{selected.type}</p>
              <p className="text-xs text-gray-400 mt-0.5">{selected.condition} · {selected.doctor}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${selected.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {selected.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
            <div><div className="label">Start Date</div><div className="text-gray-900">{formatShortDate(selected.startDate)}</div></div>
            <div><div className="label">End Date</div><div className="text-gray-900">{formatShortDate(selected.endDate)}</div></div>
            <div><div className="label">Total Cost</div><div className="text-gray-900">₹{selected.cost.toLocaleString('en-IN')}</div></div>
            <div><div className="label">Progress</div><div className="text-gray-900">{pct}%</div></div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Sessions progress</span>
              <span>{selected.completedSessions} of {selected.totalSessions} completed</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#52B788] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mb-5">
            <div className="label">Session grid</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Array.from({ length: selected.totalSessions }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                    i < selected.completedSessions
                      ? 'bg-[#1B4332] text-white'
                      : i === selected.completedSessions
                      ? 'border-2 border-[#1B4332] text-[#1B4332]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {canMarkSession && (
            <button
              type="button"
              disabled={markingSession}
              onClick={() => markSessionComplete(selected)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {markingSession ? (
                <><Loader2 size={16} className="animate-spin" /> Saving…</>
              ) : (
                <><CheckCircle2 size={16} /> Mark session {selected.completedSessions + 1} complete</>
              )}
            </button>
          )}

          {selected.status === 'completed' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100 text-green-800 text-sm">
              <CheckCircle2 size={16} />
              All sessions completed for this programme
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
          {(['treatments', 'packages'] as ViewMode[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {v}
            </button>
          ))}
        </div>
        {view === 'treatments' && (
          <div className="flex gap-1">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${filter === f ? 'bg-[#1B4332] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {f} {f === 'all' ? `(${treatments.length})` : `(${treatments.filter(t => t.status === f).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'treatments' ? (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={44} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              {filter === 'all' ? 'No treatment plans yet' : `No ${filter} treatments`}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Assign a package to a patient to create a plan</p>
            <button type="button" onClick={() => setView('packages')} className="btn-primary text-xs">
              Browse packages
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(t => {
              const pct = Math.round((t.completedSessions / t.totalSessions) * 100)
              return (
                <button key={t.id} type="button" onClick={() => setSelected(t)} className="card p-4 text-left hover:border-[#1B4332]/30 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-sm font-semibold text-gray-900">{t.patient}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                  </div>
                  <div className="text-xs text-[#1B4332] font-medium mb-0.5">{t.type}</div>
                  <div className="text-xs text-gray-400 mb-3">{t.condition}</div>
                  <div className="mb-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t.completedSessions}/{t.totalSessions} sessions</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#52B788] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span className="truncate">{t.doctor.replace('Dr. ', 'Dr.')}</span>
                    <span>₹{t.cost.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-4">
            Kairali signature therapy packages — assign to a patient to create a treatment plan with sessions and billing
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {TREATMENT_PACKAGES.map(pkg => (
              <div key={pkg.id} className="card p-4 flex flex-col">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="text-sm font-semibold text-gray-900">{pkg.name}</div>
                  {pkg.highlight && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                      {pkg.highlight}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{pkg.duration}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                    {pkg.totalSessions} session{pkg.totalSessions !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2 flex-1">{pkg.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {pkg.therapies.map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-bold text-[#1B4332]">₹{pkg.price.toLocaleString('en-IN')}</div>
                    {pkg.id === 'PKG006' && (
                      <div className="text-[10px] text-gray-400">per session</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openAssign(pkg)}
                    className="text-xs text-white bg-[#1B4332] px-3 py-2 rounded-lg hover:bg-[#163828] transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign package modal */}
      {assignPkg && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setAssignPkg(null)} />
          <div className="relative bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-5 lg:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Assign to Patient</h3>
                <p className="text-xs text-[#1B4332] font-medium mt-0.5">{assignPkg.name}</p>
              </div>
              <button type="button" onClick={() => !submitting && setAssignPkg(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/10 text-xs text-gray-600">
              <div className="font-medium text-gray-900 mb-1">{assignPkg.duration} · ₹{assignPkg.price.toLocaleString('en-IN')}{assignPkg.id === 'PKG006' ? '/session' : ''}</div>
              <div>{assignPkg.description}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Patient</label>
                <div className="relative mb-1.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input-field pl-9"
                    placeholder="Search patient…"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                </div>
                <select
                  className={`input-field ${formErrors.patientId ? 'border-red-400' : ''}`}
                  value={assignForm.patientId}
                  onChange={e => {
                    const patient = clinicIndex.getPatient(e.target.value)
                    setAssignForm(f => ({
                      ...f,
                      patientId: e.target.value,
                      condition: f.condition || patient?.purpose || assignPkg.conditionHint,
                    }))
                    setFormErrors(prev => ({ ...prev, patientId: '' }))
                  }}
                >
                  <option value="">Select patient</option>
                  {filteredPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.prakriti} · {p.purpose}
                    </option>
                  ))}
                </select>
                {formErrors.patientId && <p className="text-xs text-red-500 mt-1">{formErrors.patientId}</p>}
              </div>

              <div>
                <label className="label">Doctor</label>
                <select
                  className={`input-field ${formErrors.doctor ? 'border-red-400' : ''}`}
                  value={assignForm.doctor}
                  onChange={e => {
                    setAssignForm(f => ({ ...f, doctor: e.target.value }))
                    setFormErrors(prev => ({ ...prev, doctor: '' }))
                  }}
                >
                  <option value="">Select doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} · {d.specialization}</option>
                  ))}
                </select>
                {formErrors.doctor && <p className="text-xs text-red-500 mt-1">{formErrors.doctor}</p>}
              </div>

              <div>
                <label className="label">Condition / Goal</label>
                <input
                  className={`input-field ${formErrors.condition ? 'border-red-400' : ''}`}
                  value={assignForm.condition}
                  onChange={e => setAssignForm(f => ({ ...f, condition: e.target.value }))}
                  placeholder="e.g. Stress & anxiety"
                />
                {formErrors.condition && <p className="text-xs text-red-500 mt-1">{formErrors.condition}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start date</label>
                  <input
                    type="date"
                    className={`input-field ${formErrors.startDate ? 'border-red-400' : ''}`}
                    value={assignForm.startDate}
                    onChange={e => setAssignForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Sessions</label>
                  {assignPkg.id === 'PKG006' ? (
                    <select
                      className="input-field"
                      value={assignForm.sessionsPreset}
                      onChange={e => {
                        const n = e.target.value
                        setAssignForm(f => ({ ...f, sessionsPreset: n, totalSessions: n }))
                      }}
                    >
                      {['1', '5', '10', '14'].map(n => (
                        <option key={n} value={n}>{n} sessions</option>
                      ))}
                    </select>
                  ) : (
                    <input className="input-field bg-gray-50" readOnly value={`${assignPkg.totalSessions} (package)`} />
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 p-2.5 rounded-lg bg-gray-50">
                Est. end: <span className="font-medium text-gray-700">
                  {formatShortDate(computeEndDate(
                    assignForm.startDate,
                    assignPkg.id === 'PKG006' ? Number(assignForm.totalSessions) : assignPkg.durationDays,
                  ))}
                </span>
                {' · '}
                Total: <span className="font-medium text-[#1B4332]">
                  ₹{(assignPkg.id === 'PKG006' ? assignPkg.price * Number(assignForm.totalSessions) : assignPkg.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button type="button" className="btn-outline flex-1" disabled={submitting} onClick={() => setAssignPkg(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={submitting}
                onClick={handleAssign}
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Assigning…</> : 'Create treatment plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
