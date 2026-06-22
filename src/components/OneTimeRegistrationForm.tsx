import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Download, HelpCircle } from 'lucide-react'
import type { ClinicSettings } from '@/types/clinic'
import type { PatientRegistrationRecord, RegistrationForm } from '@/types/registration'
import {
  computeAgeFromDob,
  emptyRegistrationForm,
  fullNameFromForm,
  purposeLabel,
} from '@/types/registration'
import { NABH_SEAL_TEXT } from '@/data/consentClauses'
import SignaturePad from './SignaturePad'
import RegistrationGuideModal from './RegistrationGuideModal'
import { ConsentStep } from './registration/ConsentBlock'
import { printRegistration } from '@/lib/registrationPrint'
import { CheckRow, Field } from '@/lib/ui'

const STEPS = ['Registration', 'Consent (1)', 'Consent (2)', 'Review & Sign']

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Other'] as const

interface Props {
  clinic: ClinicSettings
  onClose: () => void
  onSubmit: (form: RegistrationForm) => Promise<PatientRegistrationRecord>
  onComplete?: () => void
  layout?: 'overlay' | 'inline'
  officeMode?: boolean
  initial?: RegistrationForm
  regNumber?: string
}

export default function OneTimeRegistrationForm({
  clinic,
  onClose,
  onSubmit,
  onComplete,
  layout = 'overlay',
  officeMode = false,
  initial,
  regNumber,
}: Props) {
  const [step, setStep] = useState(officeMode ? 0 : 0)
  const [form, setForm] = useState<RegistrationForm>(initial ?? emptyRegistrationForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState<PatientRegistrationRecord | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  const patch = (p: Partial<RegistrationForm>) => setForm(f => ({ ...f, ...p }))
  const patchKin = (p: Partial<RegistrationForm['kin']>) =>
    setForm(f => ({ ...f, kin: { ...f.kin, ...p } }))

  const onDobChange = (dateOfBirth: string) => {
    const age = computeAgeFromDob(dateOfBirth)
    patch({ dateOfBirth, ageYears: age.years, ageMonths: age.months })
  }

  const toggleArr = <T extends string>(key: 'hearAbout' | 'visitPurpose', item: T) => {
    setForm(f => {
      const arr = f[key] as T[]
      const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
      return { ...f, [key]: next }
    })
  }

  const validateStep = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.firstName.trim() && !form.lastName.trim()) e.name = 'Patient name is required'
      if (!form.mobile1.trim()) e.mobile1 = 'Primary mobile is required'
      if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required'
    }
    if (s === 1 && !form.consentPart1Accepted) e.consent1 = 'Please acknowledge Part 1 consent'
    if (s === 2) {
      if (!form.consentPart2Accepted) e.consent2 = 'Please acknowledge Part 2 consent'
      if (form.clauseAcknowledgements.some(x => !x)) e.clauses = 'Please acknowledge all clauses'
      if (!form.patientSignature) e.patientSignature = 'Patient signature is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep(s => Math.max(s - 1, 0))

  const submit = async () => {
    if (!validateStep(2)) {
      setStep(2)
      return
    }
    setSubmitting(true)
    try {
      const record = await onSubmit(form)
      setSaved(record)
    } finally {
      setSubmitting(false)
    }
  }

  const centreLine = `${clinic.name.toUpperCase()} | ${clinic.address} | T: ${clinic.phone} | E: ${clinic.email}`
  const isInline = layout === 'inline'

  if (saved) {
    const finish = () => {
      if (onComplete) onComplete()
      else onClose()
    }
    if (isInline) {
      return (
        <div className="card p-6 md:p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check size={22} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Registration Complete</h3>
          <p className="text-sm text-gray-500 mb-1">{fullNameFromForm(saved.formData)}</p>
          <p className="text-xs text-[#1B4332] font-medium mb-4">{saved.regNumber}</p>
          <p className="text-xs text-gray-500 mb-4">You can now book visits from My calendar.</p>
          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center gap-2 mb-2"
            onClick={() => printRegistration(saved, clinic)}
          >
            <Download size={15} /> Download / Print Form
          </button>
          <button type="button" className="btn-outline w-full" onClick={finish}>Continue to portal</button>
        </div>
      )
    }
    return (
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-6 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check size={22} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Registration Complete</h3>
          <p className="text-sm text-gray-500 mb-1">{fullNameFromForm(saved.formData)}</p>
          <p className="text-xs text-[#1B4332] font-medium mb-4">{saved.regNumber}</p>
          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center gap-2 mb-2"
            onClick={() => printRegistration(saved, clinic)}
          >
            <Download size={15} /> Download / Print Form
          </button>
          <button type="button" className="btn-outline w-full" onClick={onClose}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className={isInline ? 'rounded-xl border border-gray-200 bg-white overflow-hidden' : 'fixed inset-0 z-50 flex flex-col bg-gray-50'}>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[#1B4332]">One Time Registration</h2>
          <p className="text-[10px] text-gray-400">{clinic.name} · {STEPS[step]}</p>
        </div>
        <div className="flex items-center gap-1">
          {!isInline && (
            <>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="p-2 text-gray-400 hover:text-[#1B4332] rounded-lg hover:bg-gray-100"
                aria-label="Registration guide"
              >
                <HelpCircle size={18} />
              </button>
              <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {!isInline && <RegistrationGuideModal open={showGuide} onClose={() => setShowGuide(false)} />}

      <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />
              <div className={`text-[9px] mt-1 truncate ${i === step ? 'text-[#1B4332] font-medium' : 'text-gray-400'}`}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={isInline ? 'max-h-[70vh] overflow-y-auto p-4 md:p-6' : 'flex-1 overflow-y-auto p-4 lg:p-6'}>
        <div className="max-w-3xl mx-auto space-y-4">
          {step === 0 && (
            <>
              <div className="card p-4 text-center border-[#1B4332]/20 bg-[#1B4332]/[0.03]">
                <div className="text-sm font-bold text-[#1B4332]">Kairali Ayurvedic Centre</div>
                <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">One Time Registration Form</div>
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{centreLine}</p>
                <p className="text-[10px] italic text-gray-600 mt-2 p-2 border border-gray-200 rounded-lg bg-white">{NABH_SEAL_TEXT}</p>
              </div>

              <div className="card p-4 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Registration Date</label>
                  <input type="date" className="input-field" value={form.regDate} onChange={e => patch({ regDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Reg No (Office)</label>
                  <input className="input-field bg-gray-50" readOnly value={regNumber ?? `KACPL / ___ / ___ / ___`} />
                  <p className="text-[10px] text-gray-400 mt-0.5">Assigned on save</p>
                </div>
              </div>

              <p className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide">
                (To be filled in English with Black Ink in Capital Letters)
              </p>

              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Patient Demographics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="label">Title</label>
                    <select className="input-field" value={form.title} onChange={e => patch({ title: e.target.value as RegistrationForm['title'] })}>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {form.title === 'Other' && (
                    <div>
                      <label className="label">Title (Other)</label>
                      <input className="input-field" value={form.titleOther} onChange={e => patch({ titleOther: e.target.value })} />
                    </div>
                  )}
                  <div><label className="label">Last (Surname)</label><input className="input-field uppercase" value={form.lastName} onChange={e => patch({ lastName: e.target.value.toUpperCase() })} /></div>
                  <div><label className="label">First Name</label><input className="input-field uppercase" value={form.firstName} onChange={e => patch({ firstName: e.target.value.toUpperCase() })} /></div>
                  <div><label className="label">Middle Name</label><input className="input-field uppercase" value={form.middleName} onChange={e => patch({ middleName: e.target.value.toUpperCase() })} /></div>
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" className="input-field" value={form.dateOfBirth} onChange={e => onDobChange(e.target.value)} />
                    {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                  </div>
                  <div><label className="label">Age (Years)</label><input className="input-field bg-gray-50" readOnly value={form.ageYears} /></div>
                  <div><label className="label">Age (Months)</label><input className="input-field bg-gray-50" readOnly value={form.ageMonths} /></div>
                </div>

                <div>
                  <label className="label">Gender</label>
                  <div className="flex gap-4 text-sm">
                    {([['M', 'Male'], ['F', 'Female'], ['O', 'Others']] as const).map(([v, l]) => (
                      <label key={v} className="flex items-center gap-1.5">
                        <input type="radio" name="gender" checked={form.gender === v} onChange={() => patch({ gender: v })} className="accent-[#1B4332]" />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                <div><label className="label">Occupation</label><input className="input-field uppercase" value={form.occupation} onChange={e => patch({ occupation: e.target.value.toUpperCase() })} /></div>

                <div><label className="label">Residential Address (Line 1)</label><input className="input-field uppercase" value={form.addressLine1} onChange={e => patch({ addressLine1: e.target.value.toUpperCase() })} /></div>
                <div><label className="label">Line 2</label><input className="input-field uppercase" value={form.addressLine2} onChange={e => patch({ addressLine2: e.target.value.toUpperCase() })} /></div>
                <div><label className="label">Line 3</label><input className="input-field uppercase" value={form.addressLine3} onChange={e => patch({ addressLine3: e.target.value.toUpperCase() })} /></div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="label">City / Town</label><input className="input-field" value={form.city} onChange={e => patch({ city: e.target.value })} /></div>
                  <div><label className="label">Pin / Zip Code</label><input className="input-field" value={form.pinCode} onChange={e => patch({ pinCode: e.target.value })} maxLength={6} /></div>
                  <div><label className="label">State</label><input className="input-field" value={form.state} onChange={e => patch({ state: e.target.value })} /></div>
                  <div><label className="label">Country</label><input className="input-field" value={form.country} onChange={e => patch({ country: e.target.value })} /></div>
                </div>
                <div><label className="label">Nationality</label><input className="input-field" value={form.nationality} onChange={e => patch({ nationality: e.target.value })} /></div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <div className="w-20"><label className="label">Res STD</label><input className="input-field" value={form.telResStd} onChange={e => patch({ telResStd: e.target.value })} /></div>
                    <div className="flex-1"><label className="label">Tel (Res)</label><input className="input-field" value={form.telResNumber} onChange={e => patch({ telResNumber: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20"><label className="label">Off STD</label><input className="input-field" value={form.telOfficeStd} onChange={e => patch({ telOfficeStd: e.target.value })} /></div>
                    <div className="flex-1"><label className="label">Office</label><input className="input-field" value={form.telOfficeNumber} onChange={e => patch({ telOfficeNumber: e.target.value })} /></div>
                  </div>
                  <div><label className="label">Mobile 1 *</label><input className="input-field" value={form.mobile1} onChange={e => patch({ mobile1: e.target.value })} />{errors.mobile1 && <p className="text-xs text-red-500">{errors.mobile1}</p>}</div>
                  <div><label className="label">Mobile 2</label><input className="input-field" value={form.mobile2} onChange={e => patch({ mobile2: e.target.value })} /></div>
                </div>
                <div><label className="label">Email-Id</label><input type="email" className="input-field" value={form.email} onChange={e => patch({ email: e.target.value })} /></div>
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Responsible Person / Kin Details</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  {(['father', 'mother', 'husband', 'wife', 'other'] as const).map(r => (
                    <label key={r} className="flex items-center gap-1 capitalize">
                      <input type="radio" name="kinRel" checked={form.kin.relation === r} onChange={() => patchKin({ relation: r })} className="accent-[#1B4332]" />
                      {r}
                    </label>
                  ))}
                  {form.kin.relation === 'other' && (
                    <input className="input-field w-32" placeholder="Specify" value={form.kin.relationOther} onChange={e => patchKin({ relationOther: e.target.value })} />
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><label className="label">Kin Title</label>
                    <select className="input-field" value={form.kin.title} onChange={e => patchKin({ title: e.target.value as RegistrationForm['kin']['title'] })}>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Last Name</label><input className="input-field" value={form.kin.lastName} onChange={e => patchKin({ lastName: e.target.value })} /></div>
                  <div><label className="label">First Name</label><input className="input-field" value={form.kin.firstName} onChange={e => patchKin({ firstName: e.target.value })} /></div>
                  <div><label className="label">Middle Name</label><input className="input-field" value={form.kin.middleName} onChange={e => patchKin({ middleName: e.target.value })} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="label">Contact No.</label><input className="input-field" value={form.kin.contactNo} onChange={e => patchKin({ contactNo: e.target.value })} /></div>
                  <div><label className="label">Emergency Contact</label><input className="input-field" value={form.kin.emergencyContactNo} onChange={e => patchKin({ emergencyContactNo: e.target.value })} /></div>
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Referral & Purpose</h3>
                <div><label className="label">Referred by (Line 1)</label><input className="input-field" value={form.referredByLine1} onChange={e => patch({ referredByLine1: e.target.value })} /></div>
                <div><label className="label">Referred by (Line 2)</label><input className="input-field" value={form.referredByLine2} onChange={e => patch({ referredByLine2: e.target.value })} /></div>
                <div className="space-y-2">
                  <label className="label">How did you hear about us?</label>
                  <CheckRow label="Kairali Website" checked={form.hearAbout.includes('website')} onChange={() => toggleArr('hearAbout', 'website')} />
                  <CheckRow label="Social Media" checked={form.hearAbout.includes('social')} onChange={() => toggleArr('hearAbout', 'social')} />
                  <CheckRow label="Advertisements" checked={form.hearAbout.includes('advertisements')} onChange={() => toggleArr('hearAbout', 'advertisements')} />
                  <div className="flex items-center gap-2">
                    <CheckRow label="Others" checked={form.hearAbout.includes('other')} onChange={() => toggleArr('hearAbout', 'other')} />
                    <input className="input-field flex-1" placeholder="Specify" value={form.hearAboutOther} onChange={e => patch({ hearAboutOther: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label">Purpose of Visit</label>
                  <CheckRow label="Doctor's Consultation" checked={form.visitPurpose.includes('consultation')} onChange={() => toggleArr('visitPurpose', 'consultation')} />
                  <CheckRow label="Maintenance of Health" checked={form.visitPurpose.includes('maintenance')} onChange={() => toggleArr('visitPurpose', 'maintenance')} />
                  <CheckRow label="Preventive Measure" checked={form.visitPurpose.includes('preventive')} onChange={() => toggleArr('visitPurpose', 'preventive')} />
                </div>
                <div>
                  <label className="label">Signing as</label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1"><input type="radio" checked={form.signerType === 'patient'} onChange={() => patch({ signerType: 'patient' })} className="accent-[#1B4332]" /> Patient</label>
                    <label className="flex items-center gap-1"><input type="radio" checked={form.signerType === 'responsible'} onChange={() => patch({ signerType: 'responsible' })} className="accent-[#1B4332]" /> Responsible Person</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 1 && <ConsentStep part={1} form={form} patch={patch} errors={errors} clinic={clinic} />}

          {step === 2 && (
            <div className="space-y-4">
              <ConsentStep part={2} form={form} patch={patch} errors={errors} clinic={clinic} />
              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-800">Patient Disclosures</h3>
                {([
                  ['Previous Ayurveda Treatments', 'previousAyurvedaTreatments'],
                  ['Known Allergies / Reactions', 'knownAllergies'],
                  ['Allopathic Medications (with prescription)', 'allopathicMedications'],
                  ['Lifestyle Diseases / Medical History', 'lifestyleDiseases'],
                ] as const).map(([label, key]) => (
                  <Field key={key} label={label} rows={2} value={form[key]}
                    onChange={v => patch({ [key]: v })} />
                ))}
              </div>
              <div className="card p-4 space-y-4">
                <SignaturePad label="Patient / Responsible Person Signature *" value={form.patientSignature} onChange={v => patch({ patientSignature: v })} />
                {errors.patientSignature && <p className="text-xs text-red-500">{errors.patientSignature}</p>}
                {!isInline && (
                  <>
                    <SignaturePad label="Kairali Representative Signature (optional)" value={form.kairaliRepSignature} onChange={v => patch({ kairaliRepSignature: v })} />
                    <Field label="Representative Comments" value={form.kairaliRepComments} onChange={v => patch({ kairaliRepComments: v })} />
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-4 space-y-3 text-sm">
              <h3 className="font-semibold text-gray-900">Review before submitting</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Name:</span> {fullNameFromForm(form)}</div>
                <div><span className="text-gray-500">DOB:</span> {form.dateOfBirth}</div>
                <div><span className="text-gray-500">Mobile:</span> {form.mobile1}</div>
                <div><span className="text-gray-500">Email:</span> {form.email || '—'}</div>
                <div className="sm:col-span-2"><span className="text-gray-500">Address:</span> {[form.addressLine1, form.city, form.state, form.pinCode].filter(Boolean).join(', ')}</div>
                <div className="sm:col-span-2"><span className="text-gray-500">Purpose:</span> {purposeLabel(form.visitPurpose) || '—'}</div>
              </div>
              <p className="text-[11px] text-gray-500">On submit, patient record and signed registration will be saved. You can print the official 3-page form immediately after.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 p-4 flex gap-2 shrink-0 max-w-3xl mx-auto w-full">
        {step > 0 && (
          <button type="button" className="btn-outline flex items-center gap-1" onClick={back}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn-primary flex items-center gap-1" onClick={next}>
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={submitting} onClick={submit}>
            {submitting ? 'Saving…' : 'Complete Registration'}
          </button>
        )}
      </footer>
    </div>
  )
}
