import type { PrismaClient } from '@prisma/client'

export function nameFromForm(form: Record<string, unknown>) {
  const first = String(form.firstName ?? '').trim()
  const middle = String(form.middleName ?? '').trim()
  const last = String(form.lastName ?? '').trim()
  const combined = [first, middle, last].filter(Boolean).join(' ')
  if (combined) return combined
  const title = String(form.title ?? '').trim()
  return [title, last].filter(Boolean).join(' ')
}

export function purposeFromForm(form: Record<string, unknown>) {
  const purposes = form.visitPurpose as string[] | undefined
  const map: Record<string, string> = {
    consultation: "Doctor's Consultation",
    maintenance: 'Maintenance of Health',
    preventive: 'Preventive Measure',
  }
  if (!purposes?.length) return 'General Wellness'
  return purposes.map(p => map[p] ?? p).join(', ')
}

export function referralFromForm(form: Record<string, unknown>) {
  const items = form.hearAbout as string[] | undefined
  const map: Record<string, string> = {
    website: 'Kairali Website',
    social: 'Social Media',
    advertisements: 'Advertisements',
    other: (form.hearAboutOther as string) || 'Others',
  }
  if (!items?.length) return 'Walk-in'
  return items.map(h => map[h] ?? h).join(', ')
}

export function validateRegistrationForm(form: Record<string, unknown>): string | null {
  if (!form.firstName && !form.lastName) return 'Patient name is required'
  if (!form.mobile1) return 'Primary mobile number is required'
  if (!form.dateOfBirth) return 'Date of birth is required'
  if (!form.consentPart1Accepted || !form.consentPart2Accepted) {
    return 'Both consent parts must be acknowledged'
  }
  const clauses = form.clauseAcknowledgements as boolean[] | undefined
  if (!clauses || clauses.length < 8 || clauses.some(c => !c)) {
    return 'All consent clauses must be acknowledged'
  }
  if (!form.patientSignature) return 'Patient signature is required'
  return null
}

export async function nextRegNumber(prisma: PrismaClient, tenantId: string) {
  const year = new Date().getFullYear()
  const prefix = `KACPL/${year}/`
  const existing = await prisma.patientRegistration.findMany({
    where: { tenantId },
    select: { regNumber: true },
  })
  const seqForYear = existing
    .map(r => r.regNumber)
    .filter(n => n.startsWith(prefix))
    .map(n => {
      const parts = n.split('/')
      return Number(parts[2]) || 0
    })
  const next = seqForYear.length ? Math.max(...seqForYear) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}/GRG`
}

export function mapRegistration(r: {
  id: string
  patientId: string
  regNumber: string
  formData: unknown
  patientSignature: string | null
  signerType: string
  kairaliRepSignature: string | null
  signedAt: Date
  signedByUserId: string | null
}) {
  return {
    id: r.id,
    patientId: r.patientId,
    regNumber: r.regNumber,
    formData: r.formData,
    patientSignature: r.patientSignature ?? '',
    signerType: r.signerType,
    kairaliRepSignature: r.kairaliRepSignature ?? '',
    signedAt: r.signedAt.toISOString(),
    signedByUserId: r.signedByUserId ?? '',
  }
}
