export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'prescription'
  | 'lab_report'
  | 'medical_history'
  | 'consent'
  | 'other'

export interface PatientDocument {
  id: string
  patientId: string
  docType: DocumentType
  fileName: string
  mimeType: string
  fileSize: number
  uploadedBy: string
  createdAt: string
  fileData?: string
}

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  aadhaar: 'Aadhaar',
  pan: 'PAN Card',
  prescription: 'Prescription',
  lab_report: 'Lab Report',
  medical_history: 'Medical History',
  consent: 'Consent Form',
  other: 'Other',
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
