import type { LucideIcon } from 'lucide-react'
import { CircleUser, FileText, HelpCircle, Printer, Stethoscope, UserRound } from 'lucide-react'

export type GuideRole = 'receptionist' | 'admin' | 'doctor' | 'therapist' | 'patient'

export const GUIDE_ROLES: { id: GuideRole; label: string }[] = [
  { id: 'receptionist', label: 'Receptionist' },
  { id: 'admin', label: 'Admin' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'therapist', label: 'Therapist' },
  { id: 'patient', label: 'Patient' },
]

export const GUIDE_QUICK_REF = [
  ['Receptionist', 'Patients', '+ One-Time Registration'],
  ['Admin', 'Patients → patient', 'Registration Form → Print Form'],
  ['Doctor', 'Patients → patient', 'Registration Form → Complete / Office use'],
  ['Therapist', '—', 'Ask reception'],
  ['Patient', 'Patient login → Overview', 'View reg no. · Docs tab'],
] as const

type Flow = { title: string; icon: LucideIcon; steps: string[]; note?: string }

export const GUIDE_FLOWS: Record<GuideRole, { intro?: string; flows: Flow[] }> = {
  receptionist: {
    intro: 'You handle new walk-ins. Start here when a patient arrives without a file.',
    flows: [
      { title: 'New patient registration', icon: FileText, steps: [
        'Go to Patients in the sidebar or bottom nav.',
        'Tap + One-Time Registration (top right).',
        'Complete all 4 wizard steps and collect signatures.',
        'Submit — patient and registration are saved.',
        'Optional: Documents / KYC tab, then book under Appointments.',
      ]},
      { title: 'Existing patient — form missing', icon: UserRound, steps: [
        'Patients → open patient → Registration Form tab → Complete Registration Form.',
      ]},
    ],
  },
  admin: {
    intro: 'Full access — register patients, verify forms, print copies, and manage documents.',
    flows: [
      { title: 'Register a new patient', icon: FileText, steps: ['Patients → + One-Time Registration → complete wizard.'] },
      { title: 'View, print, or verify', icon: Printer, steps: [
        'Patients → patient → Registration Form tab.',
        'Print Form for PDF; Documents / KYC for uploads.',
      ]},
    ],
  },
  doctor: {
    intro: 'Complete missing registrations and add office-use notes after consultation.',
    flows: [
      { title: 'Patient has no registration', icon: FileText, steps: [
        'Patients → patient → Registration Form → Complete Registration Form.',
      ]},
      { title: 'After consultation', icon: Stethoscope, steps: [
        'Registration Form tab → Office use section → save.',
        'Consultations → today’s appointment → save notes.',
      ]},
    ],
  },
  therapist: {
    flows: [{
      title: 'Registration is not in your menu', icon: HelpCircle,
      steps: ['Use Appointments and Treatments only.', 'Ask reception if registration is missing.'],
      note: 'Therapists cannot open the registration form.',
    }],
  },
  patient: {
    intro: 'New patients follow the in-portal registration guide; registered members book follow-ups online.',
    flows: [{
      title: 'Patient portal', icon: CircleUser,
      steps: [
        'New patient: Login → Get started tab for step-by-step registration at the centre.',
        'Registered member: Book follow-up tab → calendar and available slots.',
        'Documents, care progress, and billing are on the other tabs.',
      ],
      note: 'The one-time registration form is completed with reception at the centre.',
    }],
  },
}
