/**
 * usePermission — Role-based access control hook.
 * Inspired by OpenEMR ACL system (simplified for clinic roles).
 *
 * Permission matrix:
 *   admin       → everything
 *   doctor      → read patients/billing, write consultations/treatments
 *   receptionist→ write patients/appointments, read billing, NO reports/settings-billing
 *   therapist   → read-only on patients/billing, write treatment sessions only
 */
import { useAppSelector } from '@/store/hooks'
import { selectUser } from '@/store/selectors'
import type { Role } from '@/types/entities'

export type Permission =
  | 'patients.write'
  | 'patients.read'
  | 'appointments.write'
  | 'billing.write'
  | 'billing.read'
  | 'treatments.write'
  | 'treatments.session'   // mark session complete only
  | 'consultations.write'
  | 'reports.read'
  | 'settings.write'
  | 'staff.write'

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'patients.write', 'patients.read',
    'appointments.write',
    'billing.write', 'billing.read',
    'treatments.write', 'treatments.session',
    'consultations.write',
    'reports.read',
    'settings.write',
    'staff.write',
  ],
  doctor: [
    'patients.read', 'patients.write',
    'appointments.write',
    'billing.read',
    'treatments.write', 'treatments.session',
    'consultations.write',
    'reports.read',
  ],
  receptionist: [
    'patients.write', 'patients.read',
    'appointments.write',
    'billing.read',
    'treatments.session',
  ],
  therapist: [
    'patients.read',
    'billing.read',
    'treatments.session',
  ],
  patient: [],
}

/** Returns true if the current user has the given permission */
export function usePermission(permission: Permission): boolean {
  const user = useAppSelector(selectUser)
  if (!user) return false
  const perms = PERMISSIONS[user.role] ?? []
  return perms.includes(permission)
}

/** Returns a guard: if no permission, renders null */
export function useRoleGuard() {
  const user = useAppSelector(selectUser)
  const can = (permission: Permission) => {
    if (!user) return false
    return (PERMISSIONS[user.role] ?? []).includes(permission)
  }
  return { can, role: user?.role ?? null }
}
