import { toast } from 'sonner'
import OneTimeRegistrationForm from '@/components/OneTimeRegistrationForm'
import { api, ApiError } from '@/lib/api'
import { DEFAULT_CLINIC_SETTINGS } from '@/types/clinic'
import { emptyRegistrationForm, type RegistrationForm } from '@/types/registration'

interface PatientProfile {
  name: string
  phone: string
  email: string
  city: string
}

interface Props {
  token: string
  patient: PatientProfile
  onComplete: () => void
}

function prefillFromPatient(patient: PatientProfile): RegistrationForm {
  const form = emptyRegistrationForm()
  const parts = patient.name.trim().split(/\s+/)
  if (parts.length === 1) {
    form.firstName = parts[0]
  } else {
    form.firstName = parts[0]
    form.lastName = parts.slice(1).join(' ')
  }
  form.mobile1 = patient.phone
  form.email = patient.email
  form.city = patient.city
  return form
}

export default function PortalSelfRegistration({ token, patient, onComplete }: Props) {
  const clinic = DEFAULT_CLINIC_SETTINGS

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">One-Time Registration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Hi {patient.name.split(' ')[0]} — complete your registration here to book visits online. No clinic visit needed first.
        </p>
      </div>

      <OneTimeRegistrationForm
        layout="inline"
        clinic={clinic}
        initial={prefillFromPatient(patient)}
        onClose={onComplete}
        onComplete={onComplete}
        onSubmit={async form => {
          try {
            const { registration } = await api.portalSubmitRegistration(token, form)
            toast.success(`Registered · ${registration.regNumber}`)
            return registration
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Registration failed'
            toast.error(msg)
            throw e
          }
        }}
      />
    </div>
  )
}
