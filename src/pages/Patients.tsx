import { useState } from 'react'
import { Search, Plus, ArrowLeft, ChevronRight, X, Pencil, FileText, Download, HelpCircle } from 'lucide-react'
import type { Page } from '../App'
import type { Patient } from '../types/entities'
import { PRAKRITI_TYPES, CONDITIONS } from '../data/mockData'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  makeSelectPatientHistory,
  selectClinicSettings,
  selectPatients,
  selectRegistrationByPatientId,
  selectUser,
} from '../store/selectors'
import {
  registerPatientFormApi,
  updatePatientApi,
  updateRegistrationOfficeApi,
} from '../store/thunks/apiThunks'
import OneTimeRegistrationForm from '../components/OneTimeRegistrationForm'
import RegistrationGuideModal from '../components/RegistrationGuideModal'
import PatientDocuments from '../components/PatientDocuments'
import { printRegistration } from '../lib/registrationPrint'
import type { RegistrationForm } from '../types/registration'
import { fullNameFromForm, hearAboutLabel, purposeLabel } from '../types/registration'

export default function Patients(_props: { onNavigate: (p: Page) => void; user?: unknown }) {
  const dispatch = useAppDispatch()
  const patients = useAppSelector(selectPatients)
  const clinic = useAppSelector(selectClinicSettings)
  const authUser = useAppSelector(selectUser)
  const token = useAppSelector(state => state.auth.token)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [tab, setTab] = useState<'overview' | 'history' | 'registration' | 'documents'>('overview')
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: 'M', phone: '', email: '', city: '', occupation: '', nationality: '', prakriti: '', purpose: '', referral: '', status: 'active' as Patient['status'] })
  const [officeForm, setOfficeForm] = useState({ diagnosis: '', presentComplaints: '', treatmentPrescribed: '', doctorSignature: '' })

  const registration = useAppSelector(state =>
    selected ? selectRegistrationByPatientId(selected.id)(state) : undefined
  )

  const history = useAppSelector(state =>
    selected ? makeSelectPatientHistory(selected.id)(state) : null
  )

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    inactive: 'bg-red-100 text-red-700',
  }

  const canEditOffice = authUser?.role === 'admin' || authUser?.role === 'doctor'

  const openEdit = (p: Patient) => {
    setEditForm({
      name: p.name,
      age: String(p.age),
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      city: p.city,
      occupation: p.occupation,
      nationality: p.nationality,
      prakriti: p.prakriti,
      purpose: p.purpose,
      referral: p.referral,
      status: p.status,
    })
    setShowEdit(true)
  }

  const handleUpdate = () => {
    if (!selected) return
    const updated: Patient = {
      ...selected,
      name: editForm.name || selected.name,
      age: Number(editForm.age) || selected.age,
      gender: editForm.gender as Patient['gender'],
      phone: editForm.phone,
      email: editForm.email,
      city: editForm.city,
      occupation: editForm.occupation,
      nationality: editForm.nationality,
      prakriti: editForm.prakriti,
      purpose: editForm.purpose,
      referral: editForm.referral,
      status: editForm.status,
    }
    dispatch(updatePatientApi(updated))
    setSelected(updated)
    setShowEdit(false)
  }

  const loadOfficeForm = () => {
    if (registration?.formData.officeUse) {
      const o = registration.formData.officeUse
      setOfficeForm({
        diagnosis: o.diagnosis,
        presentComplaints: o.presentComplaints,
        treatmentPrescribed: o.treatmentPrescribed,
        doctorSignature: o.doctorSignature,
      })
    }
  }

  const saveOfficeUse = () => {
    if (!selected) return
    dispatch(updateRegistrationOfficeApi({
      patientId: selected.id,
      officeUse: {
        ...registration?.formData.officeUse,
        ...officeForm,
        filledAt: new Date().toISOString(),
        filledBy: authUser?.name ?? '',
      },
    }))
  }

  if (selected) {
    const f = registration?.formData
    return (
      <div className="p-4 lg:p-6 w-full">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to patients
        </button>
        <div className="card p-5 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500">
                {selected.id}
                {registration ? ` · ${registration.regNumber}` : ''}
                {' · '}{selected.age}y · {selected.gender === 'M' ? 'Male' : 'Female'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                aria-label="Registration guide"
              >
                <HelpCircle size={13} /> <span className="hidden sm:inline">Guide</span>
              </button>
              {registration && (
                <button
                  type="button"
                  onClick={() => printRegistration(registration, clinic)}
                  className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                >
                  <Download size={13} /> Print Form
                </button>
              )}
              <button type="button" onClick={() => openEdit(selected)} className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-2.5">
                <Pencil size={13} /> Edit
              </button>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[selected.status]}`}>{selected.status}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 border-b border-gray-100 overflow-x-auto">
            {(['overview', 'registration', 'documents', 'history'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  if (t === 'registration') loadOfficeForm()
                }}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${tab === t ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-gray-500'}`}
              >
                {t === 'registration' ? 'Registration Form' : t === 'documents' ? 'Documents / KYC' : t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['City', selected.city],
                ['Prakriti', selected.prakriti || '—'],
                ['Purpose', selected.purpose],
                ['Referral', selected.referral],
                ['Occupation', selected.occupation],
                ['Nationality', selected.nationality],
                ['Last Visit', selected.lastVisit],
                ['Balance', selected.balance ? `₹${selected.balance}` : 'Nil'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="label">{k}</div>
                  <div className="text-gray-900">{v}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'registration' && (
            <div className="mt-4 space-y-4 text-sm">
              {!registration ? (
                <div className="text-center py-10">
                  <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-3">No one-time registration on file</p>
                  <button type="button" className="btn-primary text-xs" onClick={() => setShowRegistration(true)}>
                    Complete Registration Form
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[#1B4332]/5 border border-[#1B4332]/15">
                    <div>
                      <div className="text-xs text-gray-500">Registration No.</div>
                      <div className="font-semibold text-[#1B4332]">{registration.regNumber}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Signed {new Date(registration.signedAt).toLocaleString('en-IN')} · {registration.signerType === 'patient' ? 'Patient' : 'Responsible person'}
                      </div>
                    </div>
                    <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={() => printRegistration(registration, clinic)}>
                      <Download size={14} /> Download / Print PDF
                    </button>
                  </div>

                  {f && (
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="card p-3 bg-gray-50"><span className="text-gray-500">Full Name:</span> {fullNameFromForm(f)}</div>
                      <div className="card p-3 bg-gray-50"><span className="text-gray-500">DOB:</span> {f.dateOfBirth}</div>
                      <div className="card p-3 bg-gray-50 sm:col-span-2"><span className="text-gray-500">Address:</span> {[f.addressLine1, f.addressLine2, f.city, f.state, f.pinCode].filter(Boolean).join(', ')}</div>
                      <div className="card p-3 bg-gray-50"><span className="text-gray-500">Kin:</span> {f.kin.firstName} {f.kin.lastName} ({f.kin.relation})</div>
                      <div className="card p-3 bg-gray-50"><span className="text-gray-500">Emergency:</span> {f.kin.emergencyContactNo || '—'}</div>
                      <div className="card p-3 bg-gray-50 sm:col-span-2"><span className="text-gray-500">Purpose:</span> {purposeLabel(f.visitPurpose)}</div>
                      <div className="card p-3 bg-gray-50 sm:col-span-2"><span className="text-gray-500">Heard via:</span> {hearAboutLabel(f.hearAbout, f.hearAboutOther)}</div>
                    </div>
                  )}

                  {canEditOffice && (
                    <div className="card p-4 border-2 border-gray-800">
                      <h4 className="text-xs font-bold text-center uppercase tracking-wide mb-3">For Office Use Only</h4>
                      <div className="space-y-3">
                        <div><label className="label">Diagnosis</label><input className="input-field text-xs" value={officeForm.diagnosis} onChange={e => setOfficeForm(o => ({ ...o, diagnosis: e.target.value }))} /></div>
                        <div><label className="label">Present Complaints</label><textarea className="input-field text-xs resize-none" rows={2} value={officeForm.presentComplaints} onChange={e => setOfficeForm(o => ({ ...o, presentComplaints: e.target.value }))} /></div>
                        <div><label className="label">Treatment Prescribed by Doctor</label><textarea className="input-field text-xs resize-none" rows={2} value={officeForm.treatmentPrescribed} onChange={e => setOfficeForm(o => ({ ...o, treatmentPrescribed: e.target.value }))} /></div>
                        <div><label className="label">Signature of Doctor</label><input className="input-field text-xs" value={officeForm.doctorSignature} onChange={e => setOfficeForm(o => ({ ...o, doctorSignature: e.target.value }))} /></div>
                        <button type="button" className="btn-primary text-xs w-full sm:w-auto" onClick={saveOfficeUse}>Save Office Record</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'documents' && token && (
            <div className="mt-4">
              <PatientDocuments token={token} mode="staff" patientId={selected.id} />
            </div>
          )}

          {tab === 'history' && (
            <div className="mt-4 space-y-4 text-sm">
              {!history || (!history.appointments.length && !history.consultations.length && !history.treatments.length && !history.invoices.length) ? (
                <p className="text-gray-500 text-center py-8">No visit history yet</p>
              ) : (
                <>
                  {history.appointments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Appointments</h4>
                      <div className="space-y-2">
                        {history.appointments.map(a => (
                          <div key={a.id} className="flex justify-between gap-2 p-2.5 rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium text-gray-900">{a.type}</div>
                              <div className="text-xs text-gray-500">{a.date} · {a.time} · {a.doctor}</div>
                            </div>
                            <span className="text-xs text-gray-500 capitalize shrink-0">{a.status.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {history.consultations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consultations</h4>
                      <div className="space-y-2">
                        {history.consultations.map(c => (
                          <div key={c.id} className="p-2.5 rounded-lg bg-gray-50">
                            <div className="font-medium text-gray-900">{c.condition || 'Consultation'}</div>
                            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')} · {c.therapy}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {history.treatments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Treatments</h4>
                      <div className="space-y-2">
                        {history.treatments.map(t => (
                          <div key={t.id} className="flex justify-between gap-2 p-2.5 rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium text-gray-900">{t.type}</div>
                              <div className="text-xs text-gray-500">{t.startDate} – {t.endDate}</div>
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">{t.completedSessions}/{t.totalSessions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {history.invoices.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Billing</h4>
                      <div className="space-y-2">
                        {history.invoices.map(i => (
                          <div key={i.id} className="flex justify-between gap-2 p-2.5 rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium text-gray-900">{i.id}</div>
                              <div className="text-xs text-gray-500">{i.date}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-medium">₹{i.total.toLocaleString('en-IN')}</div>
                              <div className="text-xs text-gray-500 capitalize">{i.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <RegistrationGuideModal
          open={showGuide}
          onClose={() => setShowGuide(false)}
          userRole={authUser?.role}
        />

        {showRegistration && selected && (
          <OneTimeRegistrationForm
            clinic={clinic}
            onClose={() => setShowRegistration(false)}
            onSubmit={async (form: RegistrationForm) => {
              const record = await dispatch(registerPatientFormApi({ form, patientId: selected.id })).unwrap()
              setSelected({ ...selected, name: form.firstName ? `${form.firstName} ${form.lastName}`.trim() : selected.name })
              setShowRegistration(false)
              setTab('registration')
              return record
            }}
          />
        )}

        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
            <div className="relative bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Edit Patient</h3>
                <button type="button" onClick={() => setShowEdit(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="label">Full Name</label><input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Age</label><input className="input-field" type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} /></div>
                  <div><label className="label">Gender</label>
                    <select className="input-field" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                      <option value="M">Male</option><option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div><label className="label">Phone</label><input className="input-field" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div><label className="label">Email</label><input className="input-field" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div><label className="label">City</label><input className="input-field" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} /></div>
                <div><label className="label">Prakriti</label>
                  <select className="input-field" value={editForm.prakriti} onChange={e => setEditForm({ ...editForm, prakriti: e.target.value })}>
                    {PRAKRITI_TYPES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="label">Purpose</label>
                  <select className="input-field" value={editForm.purpose} onChange={e => setEditForm({ ...editForm, purpose: e.target.value })}>
                    <option value="">Select condition</option>
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Status</label>
                  <select className="input-field" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as Patient['status'] })}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button type="button" className="btn-outline flex-1" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="button" className="btn-primary flex-1" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-xs text-gray-500 mt-0.5">Register new patients and manage records</p>
        </div>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="btn-outline flex items-center gap-1.5 text-xs shrink-0"
          aria-label="How to use registration"
        >
          <HelpCircle size={14} /> Guide
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search by name, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowRegistration(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">One-Time Registration</span>
        </button>
      </div>

      <div className="lg:hidden space-y-2">
        {filtered.map(p => (
          <button key={p.id} onClick={() => setSelected(p)} className="card w-full p-4 text-left flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] font-semibold text-sm shrink-0">
              {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
              <div className="text-xs text-gray-400">{p.phone} · {p.prakriti || '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
              <ChevronRight size={14} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr className="text-xs text-gray-500">
              {['Patient', 'ID', 'Phone', 'Prakriti', 'Purpose', 'Last Visit', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => setSelected(p)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] text-xs font-semibold">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.id}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                <td className="px-4 py-3 text-gray-600">{p.prakriti || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.purpose}</td>
                <td className="px-4 py-3 text-gray-500">{p.lastVisit}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor[p.status]}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">{filtered.length} patients</div>
      </div>

      <RegistrationGuideModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        userRole={authUser?.role}
      />

      {showRegistration && (
        <OneTimeRegistrationForm
          clinic={clinic}
          onClose={() => setShowRegistration(false)}
          onSubmit={form => dispatch(registerPatientFormApi({ form })).unwrap()}
        />
      )}
    </div>
  )
}
