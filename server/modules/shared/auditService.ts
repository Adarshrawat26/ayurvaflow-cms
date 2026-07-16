/**
 * Server-side Audit Log Service — Phase 2 stub
 * Pattern: OpenEMR log.inc / OHC Care Django signals
 *
 * Prisma v5+ removed $use() middleware in favour of $extends().
 * This stub documents both the legacy pattern (commented out) and the
 * correct Prisma v5 extension approach for when AuditLog is added to schema.
 *
 * Usage (in server/lib/prisma.ts):
 *   import { withAuditLog } from '../modules/shared/auditService'
 *   export const prisma = withAuditLog(new PrismaClient())
 */

import { PrismaClient } from '@prisma/client'

export interface AuditRecord {
  model: string
  action: 'create' | 'update' | 'delete' | 'read'
  recordId: string
  userId?: string
  changes?: Record<string, unknown>
  timestamp: Date
}

/**
 * Wraps a Prisma client with console-based audit logging via $extends.
 * Phase 2: replace console.info with prisma.auditLog.create once model exists.
 */
export function withAuditLog(client: PrismaClient): PrismaClient {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args)

          const mutating = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany']
          if (!mutating.includes(operation)) return result

          const record: AuditRecord = {
            model: model ?? 'Unknown',
            action: operation.startsWith('delete')
              ? 'delete'
              : operation.startsWith('create')
                ? 'create'
                : 'update',
            recordId: (result as { id?: string } | null)?.id ?? 'unknown',
            timestamp: new Date(),
            changes: (args as { data?: Record<string, unknown> }).data,
          }

          // Phase 2: await client.auditLog.create({ data: record })
          console.info('[AuditLog]', record.model, record.action, record.recordId)

          return result
        },
      },
    },
  }) as unknown as PrismaClient
}
