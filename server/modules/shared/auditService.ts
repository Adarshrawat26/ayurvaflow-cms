/**
 * Server-side Audit Log Service
 * Phase 2 implementation — Prisma middleware → AuditLog table
 *
 * This file documents the pattern for wiring persistent audit logging.
 * Currently the frontend uses an in-session audit trail (auditMiddleware.ts).
 * When the AuditLog Prisma model is added, wire this middleware into prisma client.
 *
 * Usage (in server/lib/prisma.ts):
 *   import { withAuditLog } from '../modules/shared/auditService'
 *   const prisma = withAuditLog(new PrismaClient())
 *
 * Pattern inspired by: OpenEMR log.inc, OHC Care Django signals
 */

import type { PrismaClient } from '@prisma/client'

export interface AuditRecord {
  model: string
  action: 'create' | 'update' | 'delete' | 'read'
  recordId: string
  userId?: string
  changes?: Record<string, unknown>
  timestamp: Date
}

/**
 * Wraps a Prisma client with audit logging middleware.
 * Uncomment and use once the AuditLog model exists in schema.prisma.
 */
export function withAuditLog(prisma: PrismaClient): PrismaClient {
  prisma.$use(async (params, next) => {
    const result = await next(params)

    // Only log mutating operations
    if (!['create', 'update', 'delete', 'upsert'].includes(params.action)) {
      return result
    }

    const record: AuditRecord = {
      model: params.model ?? 'Unknown',
      action: params.action === 'upsert' ? 'update' : params.action as AuditRecord['action'],
      recordId: (result as { id?: string })?.id ?? 'unknown',
      timestamp: new Date(),
      changes: params.args?.data as Record<string, unknown>,
    }

    // Phase 2: persist to DB
    // await prisma.auditLog.create({ data: record })
    console.info('[AuditLog]', record.model, record.action, record.recordId)

    return result
  })

  return prisma
}
