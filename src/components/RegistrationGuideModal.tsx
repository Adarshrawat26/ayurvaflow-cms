import { useEffect, useState } from 'react'
import {
  CalendarClock,
  CircleUser,
  ClipboardPlus,
  FileText,
  HelpCircle,
  Printer,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import type { Role } from '@/types/entities'
import ModalShell from './ModalShell'

type GuideRole = 'receptionist' | 'admin' | 'doctor' | 'therapist' | 'patient'

interface Props {
  open: boolean
  onClose: () => void
  userRole?: Role
}

const ROLES: { id: GuideRole; label: string; canAccess: boolean }[] = [
  { id: 'receptionist', label: 'Receptionist', canAccess: true },
  { id: 'admin', label: 'Admin', canAccess: true },
  { id: 'doctor', label: 'Doctor', canAccess: true },
  { id: 'therapist', label: 'Therapist', canAccess: false },
  { id: 'patient', label: 'Patient', canAccess: false },
]

function defaultGuideRole(role?: Role): GuideRole {
  if (role === 'receptionist' || role === 'admin' || role === 'doctor') return role
  if (role === 'therapist') return 'therapist'
  if (role === 'patient') return 'patient'
  return 'receptionist'
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-gray-700">
          <span className="w-5 h-5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

function FlowCard({
  title,
  icon: Icon,
  steps,
  note,
}: {
  title: string
  icon: React.ElementType
  steps: string[]
  note?: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
          <Icon size={16} className="text-[#1B4332]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <StepList steps={steps} />
      {note && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
          {note}
        </p>
      )}
    </div>
  )
}

function RoleContent({ role }: { role: GuideRole }) {
  if (role === 'receptionist') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You handle new walk-ins. Start here when a patient arrives without a file.
        </p>
        <FlowCard
          title="New patient registration"
          icon={FileText}
          steps={[
            'Go to Patients in the sidebar or bottom nav.',
            'Tap the green + One-Time Registration button (top right, next to search).',
            'Complete all 4 steps: Registration → Consent (1) → Consent (2) → Review & Sign.',
            'Collect patient and Kairali representative signatures on the last step.',
            'Submit — the patient is created and the form is saved automatically.',
            'Optional: open the patient → Documents / KYC tab to upload Aadhaar or PAN.',
            'Book their first visit under Appointments.',
          ]}
        />
        <FlowCard
          title="Existing patient — form missing"
          icon={UserRound}
          steps={[
            'Patients → search and open the patient.',
            'Open the Registration Form tab.',
            'Tap Complete Registration Form and finish the wizard.',
          ]}
        />
      </div>
    )
  }

  if (role === 'admin') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Full access — register patients, verify forms, print copies, and manage documents.
        </p>
        <FlowCard
          title="Register a new patient"
          icon={FileText}
          steps={[
            'Patients → + One-Time Registration.',
            'Complete the 4-step wizard with the patient present.',
            'After submit, find them in the patient list.',
          ]}
        />
        <FlowCard
          title="View, print, or verify"
          icon={Printer}
          steps={[
            'Patients → open the patient.',
            'Registration Form tab — check registration number and signed date.',
            'Tap Print Form for a PDF copy.',
            'Documents / KYC tab — upload or review identity documents.',
          ]}
        />
      </div>
    )
  }

  if (role === 'doctor') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Complete missing registrations and add clinical office-use notes after consultation.
        </p>
        <FlowCard
          title="Patient has no registration"
          icon={FileText}
          steps={[
            'Patients → search and open the patient.',
            'Registration Form tab → Complete Registration Form.',
            'Walk the patient through consent and signatures.',
          ]}
        />
        <FlowCard
          title="After consultation"
          icon={Stethoscope}
          steps={[
            'Stay on Registration Form tab — scroll to Office use.',
            'Fill diagnosis, present complaints, treatment prescribed, and your signature.',
            'Save office use.',
            'Consultations → open today’s appointment → save clinical notes.',
          ]}
        />
      </div>
    )
  }

  if (role === 'therapist') {
    return (
      <div className="space-y-4">
        <FlowCard
          title="Registration is not in your menu"
          icon={HelpCircle}
          steps={[
            'Your role has Appointments and Treatments only — not Patients.',
            'If a patient’s registration seems missing, ask reception or admin.',
            'Use Appointments to see today’s schedule.',
            'Use Treatments to mark therapy sessions complete.',
          ]}
          note="Therapists cannot open the one-time registration form. Reception or a doctor must complete it."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Patients use a separate portal. Staff complete registration at the centre.
      </p>
      <FlowCard
        title="Patient portal (self-service)"
        icon={CircleUser}
        steps={[
          'On the login screen, switch to Patient (not Staff).',
          'Sign in with your patient email and password.',
          'Overview — see your profile and registration number (if staff completed the form).',
          'Docs — upload Aadhaar, PAN, prescriptions, or lab reports.',
          'Appointments, Care, and Bills — view your schedule, treatment progress, and invoices.',
        ]}
        note="You cannot fill the one-time registration form yourself — reception or your doctor does that when you visit."
      />
    </div>
  )
}

export default function RegistrationGuideModal({ open, onClose, userRole }: Props) {
  const [activeRole, setActiveRole] = useState<GuideRole>(() => defaultGuideRole(userRole))

  useEffect(() => {
    if (open) setActiveRole(defaultGuideRole(userRole))
  }, [open, userRole])

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Registration guide"
      subtitle="How each role accesses the one-time registration form"
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex gap-1.5 flex-wrap">
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRole(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeRole === r.id
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
              {!r.canAccess && activeRole !== r.id && (
                <span className="opacity-60"> · view only</span>
              )}
            </button>
          ))}
        </div>

        <RoleContent role={activeRole} />

        <div className="card p-4 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick reference
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-2 pr-3 font-medium">Role</th>
                  <th className="pb-2 pr-3 font-medium">Where to go</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-3">Receptionist</td>
                  <td className="py-2 pr-3">Patients</td>
                  <td className="py-2">+ One-Time Registration</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-3">Admin</td>
                  <td className="py-2 pr-3">Patients → patient</td>
                  <td className="py-2">Registration Form → Print Form</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-3">Doctor</td>
                  <td className="py-2 pr-3">Patients → patient</td>
                  <td className="py-2">Registration Form → Complete / Office use</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-3">Therapist</td>
                  <td className="py-2 pr-3">—</td>
                  <td className="py-2">Ask reception</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Patient</td>
                  <td className="py-2 pr-3">Patient login → Overview</td>
                  <td className="py-2">View reg no. · Docs tab</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 border-[#1B4332]/15 bg-[#1B4332]/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock size={14} className="text-[#1B4332]" />
            <h3 className="text-xs font-semibold text-[#1B4332]">Full clinic journey</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Registration → Documents / KYC → Appointments → Consultations → Treatments → Billing →
            Patient portal (patient views schedule, progress, and bills).
          </p>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-gray-400">
          <ClipboardPlus size={12} className="shrink-0 mt-0.5" />
          <span>
            Wizard steps: (1) Personal &amp; contact details (2) Consent part 1 (3) Consent part 2
            &amp; medical history (4) Review &amp; sign.
          </span>
        </div>
      </div>
    </ModalShell>
  )
}
