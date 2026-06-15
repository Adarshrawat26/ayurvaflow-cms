import { Building2, ClipboardList, FileText, Stethoscope, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface OnboardingStep {
  title: string
  description: string
  icon: LucideIcon
  tips?: string[]
}

export const NEW_PATIENT_STEPS: OnboardingStep[] = [
  {
    title: 'Visit the centre',
    description: 'Walk in or call reception to schedule your first visit. Bring a valid photo ID.',
    icon: Building2,
    tips: ['Aadhaar or passport', 'Any prior medical reports', 'List of current medicines'],
  },
  {
    title: 'One-time registration',
    description: 'Reception will complete your Kairali One-Time Registration form with you — personal details, health history, and consent.',
    icon: ClipboardList,
    tips: ['Takes about 15–20 minutes', 'You sign on the reception tablet or paper copy'],
  },
  {
    title: 'Doctor consultation',
    description: 'Your first appointment is a full consultation. The doctor assesses your prakriti and recommends a care plan.',
    icon: Stethoscope,
  },
  {
    title: 'Upload documents (optional)',
    description: 'After registration you can upload Aadhaar, PAN, and prescriptions from the Documents tab in this portal.',
    icon: FileText,
  },
  {
    title: 'Book follow-ups online',
    description: 'Once registered, sign in here anytime to check the calendar and book follow-up visits.',
    icon: UserCheck,
  },
]

export const BRING_CHECKLIST = [
  'Photo ID (Aadhaar / passport)',
  'Previous prescriptions or lab reports',
  'Insurance details (if any)',
  'Emergency contact number',
]
