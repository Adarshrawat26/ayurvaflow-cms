import type { Page, Role } from '@/types/entities'

export const ALL_NAV: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patients' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' },
]

const ROLE_PAGES: Record<Role, Page[]> = {
  admin:        ['dashboard', 'patients', 'appointments', 'treatments', 'consultations', 'billing', 'reports', 'settings'],
  receptionist: ['dashboard', 'patients', 'appointments', 'billing'],
  doctor:       ['dashboard', 'patients', 'appointments', 'consultations', 'treatments', 'reports'],
  therapist:    ['dashboard', 'appointments', 'treatments'],
  patient:      [],
}

export function pagesForRole(role: Role): Page[] {
  return ROLE_PAGES[role] ?? ROLE_PAGES.admin
}

export function defaultPageForRole(role: Role): Page {
  return pagesForRole(role)[0]
}
