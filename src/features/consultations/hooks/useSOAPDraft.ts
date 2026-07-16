/**
 * useSOAPDraft — Auto-saves SOAP note form to localStorage every 30s.
 * On page open for same appointment, banner lets user recover the draft.
 * Inspired by OHC Care encounter draft-saving pattern.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConsultationForm } from '@/types/entities'

const KEY = (appointmentId: string) => `soap_draft_${appointmentId}`

export interface DraftMeta {
  appointmentId: string
  savedAt: string   // ISO timestamp
}

/** Returns a saved draft for this appointment, or null */
export function loadDraft(appointmentId: string): ConsultationForm | null {
  try {
    const raw = localStorage.getItem(KEY(appointmentId))
    return raw ? (JSON.parse(raw) as { form: ConsultationForm }).form : null
  } catch {
    return null
  }
}

/** Removes the saved draft */
export function clearDraft(appointmentId: string) {
  localStorage.removeItem(KEY(appointmentId))
}

/**
 * Auto-saves form to localStorage every 30s.
 * Returns { hasDraft, draftSavedAt, recoverDraft, discardDraft }
 */
export function useSOAPDraft(
  appointmentId: string | null,
  form: ConsultationForm,
  setForm: (f: ConsultationForm) => void,
) {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // On appt change — check for existing draft
  useEffect(() => {
    if (!appointmentId) {
      setHasDraft(false)
      setDraftSavedAt(null)
      return
    }
    const draft = loadDraft(appointmentId)
    if (draft) {
      try {
        const meta = JSON.parse(localStorage.getItem(KEY(appointmentId)) ?? '{}') as { savedAt?: string }
        setDraftSavedAt(meta.savedAt ?? null)
        setHasDraft(true)
      } catch {
        setHasDraft(false)
      }
    } else {
      setHasDraft(false)
      setDraftSavedAt(null)
    }
  }, [appointmentId])

  // Auto-save every 30s when appointment is open
  useEffect(() => {
    if (!appointmentId) return
    timerRef.current = setInterval(() => {
      const savedAt = new Date().toISOString()
      localStorage.setItem(KEY(appointmentId), JSON.stringify({ form, savedAt }))
    }, 30_000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [appointmentId, form])

  const recoverDraft = useCallback(() => {
    if (!appointmentId) return
    const draft = loadDraft(appointmentId)
    if (draft) {
      setForm(draft)
      setHasDraft(false)
    }
  }, [appointmentId, setForm])

  const discardDraft = useCallback(() => {
    if (!appointmentId) return
    clearDraft(appointmentId)
    setHasDraft(false)
    setDraftSavedAt(null)
  }, [appointmentId])

  return { hasDraft, draftSavedAt, recoverDraft, discardDraft }
}
