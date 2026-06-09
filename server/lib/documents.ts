import type { DocumentType } from '@prisma/client'

const DOC_TYPE_MAP: Record<string, DocumentType> = {
  aadhaar: 'AADHAAR',
  pan: 'PAN',
  prescription: 'PRESCRIPTION',
  lab_report: 'LAB_REPORT',
  medical_history: 'MEDICAL_HISTORY',
  consent: 'CONSENT',
  other: 'OTHER',
}

const DOC_TYPE_REVERSE: Record<DocumentType, string> = {
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  PRESCRIPTION: 'prescription',
  LAB_REPORT: 'lab_report',
  MEDICAL_HISTORY: 'medical_history',
  CONSENT: 'consent',
  OTHER: 'other',
}

export function toDocType(s: string): DocumentType {
  return DOC_TYPE_MAP[s.toLowerCase()] ?? 'OTHER'
}

export function fromDocType(t: DocumentType): string {
  return DOC_TYPE_REVERSE[t] ?? 'other'
}

export function mapDocument(d: {
  id: string
  patientId: string
  docType: DocumentType
  fileName: string
  mimeType: string
  fileSize: number
  uploadedBy: string
  createdAt: Date
}, includeData = false, fileData?: string) {
  return {
    id: d.id,
    patientId: d.patientId,
    docType: fromDocType(d.docType),
    fileName: d.fileName,
    mimeType: d.mimeType,
    fileSize: d.fileSize,
    uploadedBy: d.uploadedBy,
    createdAt: d.createdAt.toISOString(),
    ...(includeData && fileData ? { fileData } : {}),
  }
}

export const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

export const MAX_FILE_BYTES = 5 * 1024 * 1024
