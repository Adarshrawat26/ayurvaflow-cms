import { FileText } from 'lucide-react'
import type { RegistrationForm } from '@/types/registration'
import { CONSENT_CLAUSES, CONSENT_PREAMBLE, COMPANY_REGISTERED_ADDRESS } from '@/data/consentClauses'
import type { ClinicSettings } from '@/types/clinic'
import { CheckRow } from '@/lib/ui'

export function ConsentStep({
  part,
  form,
  patch,
  errors,
  clinic,
}: {
  part: 1 | 2
  form: RegistrationForm
  patch: (p: Partial<RegistrationForm>) => void
  errors: Record<string, string>
  clinic: ClinicSettings
}) {
  const clauses = part === 1 ? CONSENT_CLAUSES.slice(0, 4) : CONSENT_CLAUSES.slice(4)
  const errKey = part === 1 ? 'consent1' : 'consent2'

  const setClause = (i: number, v: boolean) => {
    const clauseAcknowledgements = [...form.clauseAcknowledgements]
    clauseAcknowledgements[i] = v
    patch({ clauseAcknowledgements })
  }

  return (
    <div className="card p-4 space-y-4">
      {part === 1 && (
        <>
          <div className="flex items-center gap-2 text-[#1B4332]">
            <FileText size={16} />
            <h3 className="text-sm font-semibold">General Consent (Part 1)</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed text-justify">
            {CONSENT_PREAMBLE(clinic.address, COMPANY_REGISTERED_ADDRESS, clinic.phone, clinic.email)}
          </p>
        </>
      )}
      {part === 2 && <h3 className="text-sm font-semibold text-gray-900">General Consent (Part 2)</h3>}
      {clauses.map(c => (
        <div key={c.id} className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-semibold text-gray-800 mb-1">Clause {c.id}: {c.title}</h4>
          <p className="text-[11px] text-gray-600 leading-relaxed text-justify">{c.text}</p>
          <CheckRow label={`I have read and understood Clause ${c.id}`} checked={form.clauseAcknowledgements[c.id - 1]}
            onChange={v => setClause(c.id - 1, v)} />
        </div>
      ))}
      <CheckRow label={`I acknowledge and consent to all terms in Part ${part}`}
        checked={part === 1 ? form.consentPart1Accepted : form.consentPart2Accepted}
        onChange={v => patch(part === 1 ? { consentPart1Accepted: v } : { consentPart2Accepted: v })} />
      {errors[errKey] && <p className="text-xs text-red-500">{errors[errKey]}</p>}
      {part === 2 && errors.clauses && <p className="text-xs text-red-500">{errors.clauses}</p>}
    </div>
  )
}
