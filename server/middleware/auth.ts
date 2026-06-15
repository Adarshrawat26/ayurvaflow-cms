import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '../auth-types.js'
import { getJwtSecret } from '../lib/env.js'

export type { AuthPayload }

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  })
}

function normalizeAuth(payload: AuthPayload): AuthPayload {
  return {
    ...payload,
    accountType: payload.accountType ?? 'staff',
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  try {
    const token = header.slice(7)
    req.auth = normalizeAuth(jwt.verify(token, getJwtSecret()) as AuthPayload)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.accountType === 'patient') {
    res.status(403).json({ error: 'Staff access required' })
    return
  }
  next()
}

export function requirePatient(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.accountType !== 'patient' || !req.auth.patientId) {
    res.status(403).json({ error: 'Patient portal access required' })
    return
  }
  next()
}
