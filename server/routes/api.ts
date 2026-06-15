import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import {
  fmtDate,
  fromApptStatus,
  fromGender,
  fromInvoiceStatus,
  fromPatientStatus,
  fromRole,
  num,
  toApptStatus,
  toGender,
  toInvoiceStatus,
  toPatientStatus,
  toRole,
  toTreatmentStatus,
} from '../lib/mappers.js'
import { requireAuth, requireStaff, signToken } from '../middleware/auth.js'
import { loginRateLimit } from '../middleware/rateLimit.js'
import { isProduction } from '../lib/env.js'
import { ALLOWED_MIME, mapDocument, MAX_FILE_BYTES, toDocType } from '../lib/documents.js'
import {
  mapRegistration,
  nameFromForm,
  nextRegNumber,
  purposeFromForm,
  referralFromForm,
  validateRegistrationForm,
} from '../lib/registration.js'
import { hasSameDayConflict } from '../lib/intervals.js'

const router = Router()

function handleRouteError(res: import('express').Response, err: unknown, label: string) {
  console.error(`${label}:`, err)
  const msg = err instanceof Error ? err.message : String(err)
  if (
    msg.includes('does not exist')
    || msg.includes('Unable to open')
    || msg.includes('SQLite')
    || msg.includes('SQLITE')
  ) {
    res.status(503).json({ error: 'Database is still initializing. Wait a minute and try again.' })
    return
  }
  res.status(500).json({ error: 'Internal server error' })
}

router.get('/setup-status', async (_req, res) => {
  try {
    const [users, patientAccounts] = await Promise.all([
      prisma.user.count(),
      prisma.patientAccount.count(),
    ])
    res.json({ ok: true, users, patientAccounts })
  } catch (err) {
    handleRouteError(res, err, 'setup-status')
  }
})

function parseClinicSettings(tenant: { name: string; settings: unknown }) {
  const s = (tenant.settings ?? {}) as Record<string, string>
  return {
    name: tenant.name,
    address: s.address ?? '3056 P, Sector 46, Gurgaon 122033',
    phone: s.phone ?? '+91 8800661733',
    email: s.email ?? 'gurgaon@kairalicentres.com',
    gst: s.gst ?? '32AABCK0123A1Z5',
    openTime: s.openTime ?? '08:00',
    closeTime: s.closeTime ?? '20:00',
    website: s.website ?? 'https://kairalicenters.com',
  }
}

function mapPatient(p: {
  id: string
  name: string
  age: number
  gender: Parameters<typeof toGender>[0]
  phone: string
  email: string | null
  city: string | null
  referralSource: string | null
  purpose: string | null
  prakriti: string | null
  status: Parameters<typeof toPatientStatus>[0]
  lastVisit: Date | null
  balance: Parameters<typeof num>[0]
  occupation: string | null
  nationality: string | null
}) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    gender: toGender(p.gender),
    phone: p.phone,
    email: p.email ?? '',
    city: p.city ?? '',
    referral: p.referralSource ?? '',
    purpose: p.purpose ?? '',
    prakriti: p.prakriti ?? '',
    status: toPatientStatus(p.status),
    lastVisit: fmtDate(p.lastVisit),
    balance: num(p.balance),
    occupation: p.occupation ?? '',
    nationality: p.nationality ?? '',
  }
}

async function syncPatientBalance(patientId: string) {
  const allInvoices = await prisma.invoice.findMany({ where: { patientId } })
  const balance = allInvoices.reduce((a, i) => a + (num(i.total) - num(i.paid)), 0)
  await prisma.patient.update({ where: { id: patientId }, data: { balance } })
  return balance
}

function mapConsultation(c: {
  id: string
  appointmentId: string | null
  patientId: string
  patient: { name: string }
  complaints: string | null
  duration: string | null
  history: string | null
  allergies: string | null
  pulse: string | null
  tongue: string | null
  eyes: string | null
  skin: string | null
  prakriti: string | null
  vikruti: string | null
  condition: string | null
  therapy: string | null
  sessions: number | null
  medicines: string | null
  diet: string | null
  lifestyle: string | null
  followUp: string | null
  createdAt: Date
}, doctorName = '') {
  return {
    id: c.id,
    appointmentId: c.appointmentId ?? '',
    patientId: c.patientId,
    patient: c.patient.name,
    doctor: doctorName,
    complaints: c.complaints ?? '',
    duration: c.duration ?? '',
    history: c.history ?? '',
    allergies: c.allergies ?? '',
    pulse: c.pulse ?? '',
    tongue: c.tongue ?? '',
    eyes: c.eyes ?? '',
    skin: c.skin ?? '',
    prakriti: c.prakriti ?? '',
    vikruti: c.vikruti ?? '',
    condition: c.condition ?? '',
    therapy: c.therapy ?? '',
    sessions: String(c.sessions ?? ''),
    medicines: c.medicines ?? '',
    diet: c.diet ?? '',
    lifestyle: c.lifestyle ?? '',
    followUp: c.followUp ?? '',
    createdAt: c.createdAt.toISOString(),
  }
}

const consultationData = (body: Record<string, unknown>) => ({
  complaints: body.complaints as string | undefined,
  duration: body.duration as string | undefined,
  history: body.history as string | undefined,
  allergies: body.allergies as string | undefined,
  pulse: body.pulse as string | undefined,
  tongue: body.tongue as string | undefined,
  eyes: body.eyes as string | undefined,
  skin: body.skin as string | undefined,
  prakriti: body.prakriti as string | undefined,
  vikruti: body.vikruti as string | undefined,
  condition: body.condition as string | undefined,
  therapy: body.therapy as string | undefined,
  sessions: body.sessions ? Number(body.sessions) : null,
  medicines: body.medicines as string | undefined,
  diet: body.diet as string | undefined,
  lifestyle: body.lifestyle as string | undefined,
  followUp: body.followUp as string | undefined,
})

async function mapStaff(user: {
  id: string
  firstName: string
  lastName: string
  role: Parameters<typeof toRole>[0]
  specialization: string | null
  experience: number
  phone: string | null
  email: string
  isActive: boolean
  joinDate: Date
}) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: toRole(user.role),
    specialization: user.specialization ?? '',
    experience: user.experience,
    phone: user.phone ?? '',
    email: user.email,
    status: user.isActive ? 'active' : 'inactive',
    joinDate: fmtDate(user.joinDate),
  }
}

async function bootstrapData(tenantId: string) {
  const [staff, patients, appointments, treatments, invoices, consultations, registrations] = await Promise.all([
    prisma.user.findMany({ where: { tenantId } }),
    prisma.patient.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
    prisma.appointment.findMany({ where: { tenantId }, include: { patient: true }, orderBy: { date: 'asc' } }),
    prisma.treatmentPlan.findMany({ where: { tenantId }, include: { patient: true } }),
    prisma.invoice.findMany({ where: { tenantId }, include: { patient: true }, orderBy: { date: 'desc' } }),
    prisma.consultation.findMany({ where: { tenantId }, include: { patient: true }, orderBy: { createdAt: 'desc' } }),
    prisma.patientRegistration.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
  ])

  return {
    staff: await Promise.all(staff.map(mapStaff)),
    patients: patients.map(mapPatient),
    appointments: appointments.map(a => ({
      id: a.id,
      patientId: a.patientId,
      patient: a.patient.name,
      doctor: a.doctorName,
      date: fmtDate(a.date),
      time: a.time,
      type: a.type,
      status: toApptStatus(a.status),
      duration: a.duration,
    })),
    treatments: treatments.map(t => ({
      id: t.id,
      patientId: t.patientId,
      patient: t.patient.name,
      type: t.type,
      condition: t.condition,
      totalSessions: t.totalSessions,
      completedSessions: t.completedSessions,
      startDate: fmtDate(t.startDate),
      endDate: fmtDate(t.endDate),
      doctor: t.doctorName,
      status: toTreatmentStatus(t.status),
      cost: num(t.cost),
    })),
    invoices: invoices.map(i => ({
      id: i.id,
      patientId: i.patientId,
      patient: i.patient.name,
      date: fmtDate(i.date),
      items: i.items as { desc: string; qty: number; rate: number; amount: number }[],
      subtotal: num(i.subtotal),
      tax: num(i.tax),
      total: num(i.total),
      paid: num(i.paid),
      status: toInvoiceStatus(i.status),
    })),
    consultations: consultations.map(c => mapConsultation(c)),
    registrations: registrations.map(mapRegistration),
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post('/auth/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true },
    })

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: toRole(user.role),
      email: user.email,
      accountType: 'staff',
    })

    res.json({
      token,
      user: {
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: toRole(user.role),
        clinic: user.tenant.name,
      },
    })
  } catch (err) {
    handleRouteError(res, err, 'staff login')
  }
})

router.get('/auth/me', requireAuth, requireStaff, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: { tenant: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({
    user: {
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: toRole(user.role),
      clinic: user.tenant.name,
    },
  })
})

// ─── Bootstrap ───────────────────────────────────────────────────────────────

router.get('/bootstrap', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const [data, tenant] = await Promise.all([
    bootstrapData(tenantId),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ])
  res.json({
    ...data,
    clinicSettings: tenant ? parseClinicSettings(tenant) : undefined,
  })
})

// ─── Patients ────────────────────────────────────────────────────────────────

router.post('/patients', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body
  const count = await prisma.patient.count({ where: { tenantId } })
  const id = `P${String(count + 1).padStart(3, '0')}`

  const patient = await prisma.patient.create({
    data: {
      id,
      tenantId,
      patientCode: id,
      name: body.name,
      age: Number(body.age) || 30,
      gender: fromGender(body.gender),
      phone: body.phone,
      email: body.email,
      city: body.city,
      occupation: body.occupation,
      nationality: body.nationality,
      referralSource: body.referral,
      purpose: body.purpose,
      prakriti: body.prakriti,
      status: fromPatientStatus(body.status ?? 'active'),
      lastVisit: new Date(),
    },
  })

  res.status(201).json(mapPatient({ ...patient, balance: 0 }))
})

router.post('/patients/register', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const form = req.body.formData as Record<string, unknown>
  if (!form) {
    res.status(400).json({ error: 'Registration form data is required' })
    return
  }

  const validationError = validateRegistrationForm(form)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  const count = await prisma.patient.count({ where: { tenantId } })
  const id = `P${String(count + 1).padStart(3, '0')}`
  const regNumber = await nextRegNumber(prisma, tenantId)
  const name = nameFromForm(form)
  const gender = String(form.gender ?? 'M')
  const age = Number(form.ageYears) || 30

  const patient = await prisma.patient.create({
    data: {
      id,
      tenantId,
      patientCode: id,
      name,
      age,
      gender: fromGender(gender),
      phone: String(form.mobile1 ?? ''),
      email: String(form.email ?? ''),
      city: String(form.city ?? ''),
      occupation: String(form.occupation ?? ''),
      nationality: String(form.nationality ?? 'Indian'),
      referralSource: referralFromForm(form),
      purpose: purposeFromForm(form),
      prakriti: '',
      status: 'ACTIVE',
      lastVisit: new Date(),
    },
  })

  const registration = await prisma.patientRegistration.create({
    data: {
      tenantId,
      patientId: patient.id,
      regNumber,
      formData: form,
      patientSignature: String(form.patientSignature ?? ''),
      signerType: String(form.signerType ?? 'patient'),
      kairaliRepSignature: String(form.kairaliRepSignature ?? ''),
      signedAt: new Date(),
      signedByUserId: req.auth!.userId,
    },
  })

  res.status(201).json({
    patient: mapPatient({ ...patient, balance: 0 }),
    registration: mapRegistration(registration),
  })
})

router.get('/patients/:id/registration', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const registration = await prisma.patientRegistration.findFirst({
    where: { patientId: req.params.id, tenantId },
  })
  if (!registration) {
    res.status(404).json({ error: 'Registration not found' })
    return
  }
  res.json(mapRegistration(registration))
})

router.post('/patients/:id/registration', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const form = req.body.formData as Record<string, unknown>
  if (!form) {
    res.status(400).json({ error: 'Registration form data is required' })
    return
  }

  const validationError = validateRegistrationForm(form)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const existing = await prisma.patientRegistration.findUnique({
    where: { patientId: patient.id },
  })
  if (existing) {
    res.status(409).json({ error: 'Registration already exists for this patient' })
    return
  }

  const regNumber = await nextRegNumber(prisma, tenantId)
  const registration = await prisma.patientRegistration.create({
    data: {
      tenantId,
      patientId: patient.id,
      regNumber,
      formData: form,
      patientSignature: String(form.patientSignature ?? ''),
      signerType: String(form.signerType ?? 'patient'),
      kairaliRepSignature: String(form.kairaliRepSignature ?? ''),
      signedAt: new Date(),
      signedByUserId: req.auth!.userId,
    },
  })

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      name: nameFromForm(form),
      age: Number(form.ageYears) || patient.age,
      gender: fromGender(String(form.gender ?? 'M')),
      phone: String(form.mobile1 ?? patient.phone),
      email: String(form.email ?? patient.email ?? ''),
      city: String(form.city ?? patient.city ?? ''),
      occupation: String(form.occupation ?? patient.occupation ?? ''),
      nationality: String(form.nationality ?? patient.nationality ?? ''),
      referralSource: referralFromForm(form),
      purpose: purposeFromForm(form),
    },
  })

  const updatedPatient = await prisma.patient.findUnique({ where: { id: patient.id } })
  res.status(201).json({
    patient: mapPatient(updatedPatient!),
    registration: mapRegistration(registration),
  })
})

router.patch('/patients/:id/registration', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body
  const role = req.auth!.role
  if (body.officeUse && role !== 'admin' && role !== 'doctor') {
    res.status(403).json({ error: 'Only doctors or admins can update office records' })
    return
  }

  const existing = await prisma.patientRegistration.findFirst({
    where: { patientId: req.params.id, tenantId },
  })
  if (!existing) {
    res.status(404).json({ error: 'Registration not found' })
    return
  }

  const currentForm = existing.formData as Record<string, unknown>
  const nextForm = body.formData
    ? body.formData
    : body.officeUse
      ? { ...currentForm, officeUse: body.officeUse }
      : currentForm

  const updated = await prisma.patientRegistration.update({
    where: { id: existing.id },
    data: { formData: nextForm },
  })

  res.json(mapRegistration(updated))
})

router.patch('/patients/:id', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body

  const existing = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!existing) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const patient = await prisma.patient.update({
    where: { id: existing.id },
    data: {
      ...(body.name != null ? { name: body.name } : {}),
      ...(body.age != null ? { age: Number(body.age) } : {}),
      ...(body.gender != null ? { gender: fromGender(body.gender) } : {}),
      ...(body.phone != null ? { phone: body.phone } : {}),
      ...(body.email != null ? { email: body.email } : {}),
      ...(body.city != null ? { city: body.city } : {}),
      ...(body.occupation != null ? { occupation: body.occupation } : {}),
      ...(body.nationality != null ? { nationality: body.nationality } : {}),
      ...(body.referral != null ? { referralSource: body.referral } : {}),
      ...(body.purpose != null ? { purpose: body.purpose } : {}),
      ...(body.prakriti != null ? { prakriti: body.prakriti } : {}),
      ...(body.status != null ? { status: fromPatientStatus(body.status) } : {}),
    },
  })

  res.json(mapPatient(patient))
})

// ─── Patient documents (KYC) ─────────────────────────────────────────────────

router.get('/patients/:id/documents', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }
  const docs = await prisma.patientDocument.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json(docs.map(d => mapDocument(d)))
})

router.get('/patients/:id/documents/:docId', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }
  const doc = await prisma.patientDocument.findFirst({
    where: { id: req.params.docId, patientId: patient.id },
  })
  if (!doc) {
    res.status(404).json({ error: 'Document not found' })
    return
  }
  res.json(mapDocument(doc, true, doc.fileData))
})

router.post('/patients/:id/documents', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const body = req.body as {
    docType?: string
    fileName?: string
    mimeType?: string
    fileData?: string
  }

  if (!body.fileName || !body.mimeType || !body.fileData || !body.docType) {
    res.status(400).json({ error: 'docType, fileName, mimeType, and fileData are required' })
    return
  }
  if (!ALLOWED_MIME.includes(body.mimeType)) {
    res.status(400).json({ error: 'File type not allowed. Use PDF, JPEG, or PNG.' })
    return
  }

  const raw = body.fileData.includes(',') ? body.fileData.split(',')[1] : body.fileData
  const bytes = Buffer.byteLength(raw, 'base64')
  if (bytes > MAX_FILE_BYTES) {
    res.status(400).json({ error: 'File exceeds 5 MB limit' })
    return
  }

  const doc = await prisma.patientDocument.create({
    data: {
      tenantId,
      patientId: patient.id,
      docType: toDocType(body.docType),
      fileName: body.fileName,
      mimeType: body.mimeType,
      fileSize: bytes,
      fileData: body.fileData,
      uploadedBy: req.auth!.email,
    },
  })

  res.status(201).json(mapDocument(doc))
})

router.delete('/patients/:id/documents/:docId', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }
  const doc = await prisma.patientDocument.findFirst({
    where: { id: req.params.docId, patientId: patient.id },
  })
  if (!doc) {
    res.status(404).json({ error: 'Document not found' })
    return
  }
  await prisma.patientDocument.delete({ where: { id: doc.id } })
  res.json({ ok: true })
})

// ─── Appointments ────────────────────────────────────────────────────────────

router.post('/appointments', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body
  const patient = await prisma.patient.findFirst({ where: { id: body.patientId, tenantId } })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const day = new Date(body.date)
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)
  const sameDay = await prisma.appointment.findMany({
    where: {
      tenantId,
      doctorName: body.doctor,
      date: { gte: day, lt: nextDay },
      status: { notIn: ['NO_SHOW', 'CANCELLED'] },
    },
    select: { id: true, time: true, duration: true },
  })
  if (hasSameDayConflict(sameDay, body.time, Number(body.duration) || 45)) {
    res.status(409).json({ error: 'This doctor already has an appointment at this time' })
    return
  }

  const count = await prisma.appointment.count({ where: { tenantId } })
  const appt = await prisma.appointment.create({
    data: {
      id: `A${String(count + 1).padStart(3, '0')}`,
      tenantId,
      patientId: body.patientId,
      doctorName: body.doctor,
      date: new Date(body.date),
      time: body.time,
      type: body.type,
      status: fromApptStatus(body.status ?? 'scheduled'),
      duration: Number(body.duration) || 45,
    },
    include: { patient: true },
  })

  res.status(201).json({
    id: appt.id,
    patientId: appt.patientId,
    patient: appt.patient.name,
    doctor: appt.doctorName,
    date: fmtDate(appt.date),
    time: appt.time,
    type: appt.type,
    status: toApptStatus(appt.status),
    duration: appt.duration,
  })
})

router.patch('/appointments/:id', requireAuth, requireStaff, async (req, res) => {
  const appt = await prisma.appointment.findFirst({
    where: { id: req.params.id, tenantId: req.auth!.tenantId },
    include: { patient: true },
  })
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found' })
    return
  }

  const body = req.body
  const nextDate = body.date ? new Date(body.date) : appt.date
  const nextDoctor = body.doctor ?? appt.doctorName
  const nextTime = body.time ?? appt.time
  const nextDuration = body.duration != null ? Number(body.duration) : appt.duration

  const nextDay = new Date(nextDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const sameDay = await prisma.appointment.findMany({
    where: {
      tenantId: req.auth!.tenantId,
      doctorName: nextDoctor,
      date: { gte: nextDate, lt: nextDay },
      status: { notIn: ['NO_SHOW', 'CANCELLED'] },
      NOT: { id: appt.id },
    },
    select: { id: true, time: true, duration: true },
  })
  if (hasSameDayConflict(sameDay, nextTime, nextDuration, appt.id)) {
    res.status(409).json({ error: 'This doctor already has an appointment at this time' })
    return
  }

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: {
      ...(body.status ? { status: fromApptStatus(body.status) } : {}),
      ...(body.date ? { date: new Date(body.date) } : {}),
      ...(body.time ? { time: body.time } : {}),
      ...(body.doctor ? { doctorName: body.doctor } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(body.duration != null ? { duration: Number(body.duration) } : {}),
    },
    include: { patient: true },
  })

  res.json({
    id: updated.id,
    patientId: updated.patientId,
    patient: updated.patient.name,
    doctor: updated.doctorName,
    date: fmtDate(updated.date),
    time: updated.time,
    type: updated.type,
    status: toApptStatus(updated.status),
    duration: updated.duration,
  })
})

// ─── Invoices ────────────────────────────────────────────────────────────────

router.post('/invoices', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body
  const patient = await prisma.patient.findFirst({ where: { id: body.patientId, tenantId } })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const count = await prisma.invoice.count({ where: { tenantId } })
  const subtotal = Number(body.subtotal)
  const tax = Number(body.tax)
  const total = Number(body.total)
  const paid = Number(body.paid ?? 0)

  const inv = await prisma.invoice.create({
    data: {
      id: `INV${String(count + 1).padStart(3, '0')}`,
      tenantId,
      patientId: body.patientId,
      date: new Date(body.date ?? new Date()),
      items: body.items,
      subtotal,
      tax,
      total,
      paid,
      status: fromInvoiceStatus(total, paid),
    },
    include: { patient: true },
  })

  await syncPatientBalance(patient.id)

  res.status(201).json({
    id: inv.id,
    patientId: inv.patientId,
    patient: inv.patient.name,
    date: fmtDate(inv.date),
    items: inv.items,
    subtotal: num(inv.subtotal),
    tax: num(inv.tax),
    total: num(inv.total),
    paid: num(inv.paid),
    status: toInvoiceStatus(inv.status),
  })
})

router.patch('/invoices/:id', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body

  const existing = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId },
    include: { patient: true },
  })
  if (!existing) {
    res.status(404).json({ error: 'Invoice not found' })
    return
  }

  const total = num(existing.total)
  let paid = num(existing.paid)
  if (body.paid != null) {
    paid = Math.min(total, Number(body.paid))
  } else if (body.amount != null) {
    paid = Math.min(total, paid + Number(body.amount))
  }

  const inv = await prisma.invoice.update({
    where: { id: existing.id },
    data: {
      paid,
      status: fromInvoiceStatus(total, paid),
    },
    include: { patient: true },
  })

  await syncPatientBalance(inv.patientId)

  res.json({
    id: inv.id,
    patientId: inv.patientId,
    patient: inv.patient.name,
    date: fmtDate(inv.date),
    items: inv.items,
    subtotal: num(inv.subtotal),
    tax: num(inv.tax),
    total: num(inv.total),
    paid: num(inv.paid),
    status: toInvoiceStatus(inv.status),
  })
})

// ─── Treatments ──────────────────────────────────────────────────────────────

router.post('/treatments', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body

  const patient = await prisma.patient.findFirst({
    where: { id: body.patientId, tenantId },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const count = await prisma.treatmentPlan.count({ where: { tenantId } })
  const id = `T${String(count + 1).padStart(3, '0')}`

  const startDate = new Date(body.startDate ?? new Date())
  const endDate = new Date(startDate)
  if (body.endDate) {
    endDate.setTime(new Date(body.endDate).getTime())
  } else if (body.durationDays) {
    endDate.setDate(endDate.getDate() + Number(body.durationDays))
  }

  const treatment = await prisma.treatmentPlan.create({
    data: {
      id,
      tenantId,
      patientId: body.patientId,
      doctorId: req.auth!.role === 'doctor' ? req.auth!.userId : undefined,
      type: body.type,
      condition: body.condition,
      totalSessions: Number(body.totalSessions) || 1,
      completedSessions: 0,
      startDate,
      endDate,
      doctorName: body.doctor,
      status: 'ACTIVE',
      cost: Number(body.cost) || 0,
    },
    include: { patient: true },
  })

  res.status(201).json({
    id: treatment.id,
    patientId: treatment.patientId,
    patient: treatment.patient.name,
    type: treatment.type,
    condition: treatment.condition,
    totalSessions: treatment.totalSessions,
    completedSessions: treatment.completedSessions,
    startDate: fmtDate(treatment.startDate),
    endDate: fmtDate(treatment.endDate),
    doctor: treatment.doctorName,
    status: toTreatmentStatus(treatment.status),
    cost: num(treatment.cost),
  })
})

router.patch('/treatments/:id', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body

  const existing = await prisma.treatmentPlan.findFirst({
    where: { id: req.params.id, tenantId },
    include: { patient: true },
  })
  if (!existing) {
    res.status(404).json({ error: 'Treatment plan not found' })
    return
  }

  let completedSessions = existing.completedSessions
  if (body.action === 'complete_session') {
    completedSessions = Math.min(existing.completedSessions + 1, existing.totalSessions)
  } else if (body.completedSessions != null) {
    completedSessions = Math.min(
      Math.max(0, Number(body.completedSessions)),
      existing.totalSessions,
    )
  }

  const status =
    completedSessions >= existing.totalSessions
      ? 'COMPLETED'
      : body.status
        ? (body.status === 'completed' ? 'COMPLETED' : 'ACTIVE')
        : existing.status

  const updated = await prisma.treatmentPlan.update({
    where: { id: existing.id },
    data: { completedSessions, status },
    include: { patient: true },
  })

  res.json({
    id: updated.id,
    patientId: updated.patientId,
    patient: updated.patient.name,
    type: updated.type,
    condition: updated.condition,
    totalSessions: updated.totalSessions,
    completedSessions: updated.completedSessions,
    startDate: fmtDate(updated.startDate),
    endDate: fmtDate(updated.endDate),
    doctor: updated.doctorName,
    status: toTreatmentStatus(updated.status),
    cost: num(updated.cost),
  })
})

// ─── Consultations ───────────────────────────────────────────────────────────

router.post('/consultations', requireAuth, requireStaff, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const body = req.body
  const doctor = await prisma.user.findUnique({ where: { id: req.auth!.userId } })
  const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : ''
  const data = consultationData(body)

  if (body.appointmentId) {
    const existing = await prisma.consultation.findFirst({
      where: { appointmentId: body.appointmentId, tenantId },
      include: { patient: true },
    })
    if (existing) {
      const updated = await prisma.consultation.update({
        where: { id: existing.id },
        data,
        include: { patient: true },
      })
      res.json(mapConsultation(updated, doctorName))
      return
    }
  }

  const consultation = await prisma.consultation.create({
    data: {
      id: `C${Date.now()}`,
      tenantId,
      patientId: body.patientId,
      doctorId: req.auth!.userId,
      appointmentId: body.appointmentId || null,
      ...data,
    },
    include: { patient: true },
  })

  res.status(201).json(mapConsultation(consultation, doctorName))
})

// ─── Settings & Auth extras ──────────────────────────────────────────────────

router.patch('/settings/clinic', requireAuth, requireStaff, async (req, res) => {
  if (req.auth!.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  const body = req.body
  const tenantId = req.auth!.tenantId
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: body.name,
      settings: {
        address: body.address,
        phone: body.phone,
        email: body.email,
        gst: body.gst,
        openTime: body.openTime,
        closeTime: body.closeTime,
        website: body.website,
      },
    },
  })

  res.json(parseClinicSettings(tenant))
})

router.post('/auth/change-password', requireAuth, requireStaff, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Current password and new password (min 8 chars) are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Current password is incorrect' })
    return
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  res.json({ ok: true })
})

// ─── Staff ───────────────────────────────────────────────────────────────────

router.post('/staff', requireAuth, requireStaff, async (req, res) => {
  if (req.auth!.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  const body = req.body as { name?: string; password?: string; role?: string; email?: string; phone?: string; specialization?: string; experience?: number; status?: string; joinDate?: string }
  if (isProduction() && !body.password) {
    res.status(400).json({ error: 'Password is required when creating staff in production' })
    return
  }
  const names = (body.name as string).split(' ')
  const firstName = names[0]
  const lastName = names.slice(1).join(' ') || ''
  const hash = await bcrypt.hash(body.password ?? 'Kairali123!', 10)

  const user = await prisma.user.create({
    data: {
      id: `S${Date.now().toString().slice(-6)}`,
      tenantId: req.auth!.tenantId,
      role: fromRole(body.role),
      email: body.email.toLowerCase(),
      phone: body.phone,
      passwordHash: hash,
      firstName,
      lastName,
      specialization: body.specialization,
      experience: Number(body.experience) || 0,
      isActive: body.status !== 'inactive',
      joinDate: new Date(body.joinDate ?? new Date()),
    },
  })

  res.status(201).json(await mapStaff(user))
})

router.patch('/staff/:id', requireAuth, requireStaff, async (req, res) => {
  if (req.auth!.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  const user = await prisma.user.findFirst({
    where: { id: req.params.id, tenantId: req.auth!.tenantId },
  })
  if (!user) {
    res.status(404).json({ error: 'Staff member not found' })
    return
  }

  const body = req.body
  const names = body.name ? (body.name as string).split(' ') : null

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(names ? { firstName: names[0], lastName: names.slice(1).join(' ') || '' } : {}),
      ...(body.role ? { role: fromRole(body.role) } : {}),
      ...(body.email ? { email: body.email.toLowerCase() } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.specialization ? { specialization: body.specialization } : {}),
      ...(body.experience != null ? { experience: Number(body.experience) } : {}),
      ...(body.status ? { isActive: body.status === 'active' } : {}),
    },
  })

  res.json(await mapStaff(updated))
})

export default router
