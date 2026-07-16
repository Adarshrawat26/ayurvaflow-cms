/**
 * useDuplicateCheck — Patient de-duplication hook
 * Inspired by OpenMRS patient matching algorithm
 *
 * Before registering a new patient, checks existing patients for likely duplicates:
 * - Exact phone number match (strong signal)
 * - Name similarity ≥ 75% (fuzzy, normalized) — optional
 *
 * Returns the list of likely matches so the UI can warn the user.
 */

import { useMemo } from 'react'
import { useAppSelector } from '../../../store/hooks'
import { selectPatients } from '../../../store/selectors'
import type { Patient } from '../../../types/entities'

interface DuplicateCheckInput {
  phone?: string
  name?: string
  enabled?: boolean
}

interface DuplicateResult {
  duplicates: Patient[]
  hasPhoneMatch: boolean
  hasNameMatch: boolean
}

/**
 * Levenshtein distance — used for fuzzy name matching.
 * Normalized: 0 = identical, 1 = completely different.
 */
function normalizedLevenshtein(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^a-z0-9 ]/g, '')

  const s1 = normalize(a)
  const s2 = normalize(b)
  if (s1 === s2) return 0
  if (!s1 || !s2) return 1

  const len = Math.max(s1.length, s2.length)
  const dp: number[][] = Array.from({ length: s1.length + 1 }, (_, i) =>
    Array.from({ length: s2.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      dp[i][j] =
        s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[s1.length][s2.length] / len
}

export function useDuplicateCheck({
  phone,
  name,
  enabled = true,
}: DuplicateCheckInput): DuplicateResult {
  const patients = useAppSelector(selectPatients)

  return useMemo<DuplicateResult>(() => {
    if (!enabled || (!phone && !name)) {
      return { duplicates: [], hasPhoneMatch: false, hasNameMatch: false }
    }

    const phoneMatches: Patient[] = []
    const nameMatches: Patient[] = []

    const cleanPhone = phone?.replace(/\D/g, '') ?? ''

    for (const p of patients) {
      // Phone match — exact normalized
      if (cleanPhone.length >= 8) {
        const existing = p.phone?.replace(/\D/g, '') ?? ''
        if (existing && existing === cleanPhone) {
          phoneMatches.push(p)
          continue
        }
      }

      // Name match — fuzzy, only if no phone match yet
      if (name && name.length >= 3) {
        const similarity = 1 - normalizedLevenshtein(name, p.name)
        if (similarity >= 0.75) {
          nameMatches.push(p)
        }
      }
    }

    const all = [...new Map([...phoneMatches, ...nameMatches].map(p => [p.id, p])).values()]

    return {
      duplicates: all,
      hasPhoneMatch: phoneMatches.length > 0,
      hasNameMatch: nameMatches.length > 0,
    }
  }, [patients, phone, name, enabled])
}
