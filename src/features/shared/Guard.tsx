/**
 * Guard — Role-based render gate component.
 * Usage: <Guard permission="billing.write">...</Guard>
 * Renders children only if current user has that permission.
 * Renders fallback (or nothing) otherwise.
 */
import type { ReactNode } from 'react'
import { useRoleGuard } from './hooks/usePermission'
import type { Permission } from './hooks/usePermission'

interface GuardProps {
  permission: Permission
  children: ReactNode
  /** Optional element to render instead of nothing when access denied */
  fallback?: ReactNode
}

export default function Guard({ permission, children, fallback = null }: GuardProps) {
  const { can } = useRoleGuard()
  return can(permission) ? <>{children}</> : <>{fallback}</>
}
