import { CalendarClock, ClipboardList, FileText, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface OnboardingStep {
  title: string
  description: string
  icon: LucideIcon
  tips?: string[]
}

/** Steps shown on the public login page before sign-in */
export const PUBLIC_REGISTRATION_STEPS: OnboardingStep[] = [
  {
    title: 'Create your account',
    description: 'Sign up with your name, mobile, email, and a password — takes under a minute.',
    icon: Smartphone,
  },
  {
    title: 'Complete one-time registration',
    description: 'Fill in your details, health history, and consent digitally — about 15 minutes.',
    icon: ClipboardList,
    tips: ['Photo ID details handy', 'List of current medicines', 'Emergency contact number'],
  },
  {
    title: 'Upload documents (optional)',
    description: 'Add Aadhaar, PAN, or prescriptions from the Documents tab anytime.',
    icon: FileText,
  },
  {
    title: 'Book your visit online',
    description: 'Once registered, book your consultation or follow-up from My calendar.',
    icon: CalendarClock,
  },
]

export const REGISTRATION_CHECKLIST = [
  'Photo ID (Aadhaar / passport)',
  'Previous prescriptions or lab reports',
  'Insurance details (if any)',
  'Emergency contact number',
]
