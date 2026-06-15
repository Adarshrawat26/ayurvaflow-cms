import { CheckCircle2, ChevronRight, MapPin, Phone } from 'lucide-react'
import { BRING_CHECKLIST, NEW_PATIENT_STEPS } from '@/data/portalRegistrationGuide'

interface ClinicContact {
  phone: string
  email: string
  address: string
}

interface Props {
  patientName?: string
  clinic: string
  contact: ClinicContact
  onOpenDocuments?: () => void
  onBackToSignIn?: () => void
}

export default function PortalRegistrationOnboarding({
  patientName,
  clinic,
  contact,
  onOpenDocuments,
  onBackToSignIn,
}: Props) {
  const greeting = patientName
    ? `Hi ${patientName.split(' ')[0]} — complete your registration at ${clinic} to book online`
    : `Welcome — complete your one-time registration at ${clinic} to book follow-ups online`

  return (
    <div className="space-y-4 lg:space-y-6">
      {onBackToSignIn && (
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-xs font-medium text-[#1B4332] hover:underline"
        >
          ← Already registered? Sign in
        </button>
      )}

      <div className="text-center sm:text-left lg:max-w-none">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">One-Time Registration</h2>
        <p className="text-sm text-gray-500 mt-1">{greeting}</p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="card p-4 md:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">What to expect</h3>
          <ol className="space-y-4">
            {NEW_PATIENT_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    {i < NEW_PATIENT_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1 min-h-[12px]" />
                    )}
                  </div>
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon size={14} className="text-[#1B4332] shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{step.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                    {step.tips && (
                      <ul className="mt-2 space-y-1">
                        {step.tips.map(tip => (
                          <li key={tip} className="text-[11px] text-gray-500 flex items-start gap-1.5">
                            <CheckCircle2 size={11} className="text-[#52B788] shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.title === 'Upload documents (optional)' && onOpenDocuments && (
                      <button
                        type="button"
                        onClick={onOpenDocuments}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1B4332] hover:underline"
                      >
                        Open Documents tab <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="card p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What to bring</h3>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              {BRING_CHECKLIST.map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                  <CheckCircle2 size={12} className="text-[#1B4332] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 md:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Contact reception</h3>
            {contact.address && (
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-[#1B4332] shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </div>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:underline"
              >
                <Phone size={14} />
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="block text-xs text-gray-500 hover:text-[#1B4332]">
                {contact.email}
              </a>
            )}
            <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
              After registration you&apos;ll see your registration number here and can book follow-ups from My calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
