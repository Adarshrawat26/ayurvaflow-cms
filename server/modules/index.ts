/**
 * Server modules index — mirrors the feature-module architecture on the frontend.
 *
 * Each module owns its own routes, controllers, and service layer.
 * Currently wired via server/routes/api.ts (monolithic).
 * Phase 2 will split that into per-module routers registered here.
 *
 * Architecture pattern (OpenMRS / Care):
 *   server/modules/patients/router.ts    → Express router
 *   server/modules/patients/service.ts   → Prisma queries
 *   server/modules/patients/types.ts     → Zod schemas + TS types
 */

export const MODULE_REGISTRY = [
  'auth',
  'patients',
  'appointments',
  'consultations',
  'billing',
  'treatments',
  'settings',
  'reports',
] as const

export type ServerModule = (typeof MODULE_REGISTRY)[number]
