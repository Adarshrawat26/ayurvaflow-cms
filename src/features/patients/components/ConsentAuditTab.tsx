/**
 * ConsentAuditTab — Shows consent & registration form audit trail.
 * Renders: who signed, when, which sections were filled, signature thumbnails.
 * Pulled from PatientRegistration.formData JSON — zero schema change.
 * Inspired by OHC Care consent management module.
 */
import { useMemo } from 'react'
import { CheckCircle2, Clock, FileText, User } from 'lucide-react'
import type { PatientRegistrationRecord } from '@/types/registration'

interface ConsentAuditTabProps {
  registration: PatientRegistrationRecord | null | undefined
}

// Sections of the OTR form we track
const CONSENT_SECTIONS = [
  { key: 'patientName',        label: 'Personal Details' },
  { key: 'mobile1',            label: 'Contact Information' },
  { key: 'gender',             label: 'Demographics' },
  { key: 'prakriti',           label: 'Prakriti Assessment' },
  { key: 'medicalHistory',     label: 'Medical History' },
  { key: 'allergies',          label: 'Allergies Declared' },
  { key: 'treatmentConsent',   label: 'Treatment Consent' },
  { key: 'dataConsent',        label: 'Data Processing Consent' },
]

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ConsentAuditTab({ registration }: ConsentAuditTabProps) {
  const form = useMemo(() => {
    if (!registration?.formData) return null
    try {
      return registration.formData as unknown as Record<string, unknown>
    } catch {
      return null
    }
  }, [registration])

  if (!registration) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <FileText size={32} className="text-gray-200" />
        <p className="text-sm">No registration form found for this patient.</p>
      </div>
    )
  }

  const signedAt = registration.signedAt
  const signerType = registration.signerType ?? 'patient'
  const patientSig = form?.patientSignature as string | undefined
  const repSig = form?.kairaliRepSignature as string | undefined

  const filledSections = CONSENT_SECTIONS.filter(s => {
    const val = form?.[s.key]
    return val !== undefined && val !== null && val !== ''
  })

  return (
    <div className="space-y-5">
      {/* Signing summary */}
      <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Consent Recorded</div>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock size={11} />
                <span>Signed: {signedAt ? fmtDateTime(signedAt) : 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={11} />
                <span>Signer: <span className="capitalize">{signerType}</span></span>
              </div>
              <div>
                <span className="text-[#1B4332] font-medium">Reg #: {registration.regNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section checklist */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Form Sections Completed
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONSENT_SECTIONS.map(section => {
            const filled = filledSections.some(s => s.key === section.key)
            return (
              <div
                key={section.key}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
                  filled
                    ? 'bg-green-50 text-green-800 border border-green-100'
                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                }`}
              >
                <CheckCircle2 size={14} className={filled ? 'text-green-500' : 'text-gray-300'} />
                {section.label}
              </div>
            )
          })}
        </div>
        <div className="text-[11px] text-gray-400 mt-2">
          {filledSections.length} of {CONSENT_SECTIONS.length} sections filled
        </div>
      </div>

      {/* Signatures */}
      {(patientSig || repSig) && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Signatures
          </div>
          <div className="grid grid-cols-2 gap-3">
            {patientSig && (
              <div className="rounded-lg border border-gray-100 p-3 bg-gray-50 text-center">
                <div className="text-[10px] text-gray-400 mb-1">Patient Signature</div>
                <img
                  src={patientSig}
                  alt="Patient signature"
                  className="max-h-12 mx-auto object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
            {repSig && (
              <div className="rounded-lg border border-gray-100 p-3 bg-gray-50 text-center">
                <div className="text-[10px] text-gray-400 mb-1">Clinic Rep Signature</div>
                <img
                  src={repSig}
                  alt="Clinic rep signature"
                  className="max-h-12 mx-auto object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
