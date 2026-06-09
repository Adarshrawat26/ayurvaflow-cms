import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import {
  fmtDate,
  num,
  toApptStatus,
  toGender,
  toInvoiceStatus,
  toTreatmentStatus,
} from '../lib/mappers.js'
import { mapRegistration } from '../lib/registration.js'
import { ALLOWED_MIME, mapDocument, MAX_FILE_BYTES, toDocType } from '../lib/documents.js'
import { requireAuth, requirePatient, signToken } from '../middleware/auth.js'

const router = Router()

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const account = await prisma.patientAccount.findFirst({
    where: {
      email: email.toLowerCase(),
      isActive: true,
    },
    include: { patient: true, tenant: true },
  })

  if (!account) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, account.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  await prisma.patientAccount.update({
    where: { id: account.id },
    data: { lastLogin: new Date() },
  })

  const token = signToken({
    userId: account.id,
    tenantId: account.tenantId,
    role: 'patient',
    email: account.email,
    accountType: 'patient',
    patientId: account.patientId,
  })

  res.json({
    token,
    user: {
      name: account.patient.name,
      role: 'patient' as const,
      clinic: account.tenant.name,
      patientId: account.patientId,
      email: account.email,
    },
  })
})

router.get('/me', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { tenant: true, registration: true },
  })
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  res.json({
    patient: {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: toGender(patient.gender),
      phone: patient.phone,
      email: patient.email ?? '',
      city: patient.city ?? '',
      balance: num(patient.balance),
      prakriti: patient.prakriti ?? '',
      purpose: patient.purpose ?? '',
    },
    clinic: patient.tenant.name,
    registration: patient.registration ? mapRegistration(patient.registration) : null,
  })
})

router.get('/appointments', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const appts = await prisma.appointment.findMany({
    where: { patientId },
    orderBy: [{ date: 'desc' }, { time: 'desc' }],
  })
  res.json(appts.map(a => ({
    id: a.id,
    date: fmtDate(a.date),
    time: a.time,
    type: a.type,
    doctor: a.doctorName,
    status: toApptStatus(a.status),
    duration: a.duration,
  })))
})

router.get('/treatments', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const plans = await prisma.treatmentPlan.findMany({
    where: { patientId },
    orderBy: { startDate: 'desc' },
  })
  res.json(plans.map(t => ({
    id: t.id,
    type: t.type,
    condition: t.condition,
    totalSessions: t.totalSessions,
    completedSessions: t.completedSessions,
    startDate: fmtDate(t.startDate),
    endDate: t.endDate ? fmtDate(t.endDate) : '',
    doctor: t.doctorName,
    status: toTreatmentStatus(t.status),
    cost: num(t.cost),
  })))
})

router.get('/invoices', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const invoices = await prisma.invoice.findMany({
    where: { patientId },
    orderBy: { date: 'desc' },
  })
  res.json(invoices.map(i => ({
    id: i.id,
    date: fmtDate(i.date),
    items: i.items,
    subtotal: num(i.subtotal),
    tax: num(i.tax),
    total: num(i.total),
    paid: num(i.paid),
    status: toInvoiceStatus(i.status),
  })))
})

router.get('/documents', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const docs = await prisma.patientDocument.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(docs.map(d => mapDocument(d)))
})

router.get('/documents/:id', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const doc = await prisma.patientDocument.findFirst({
    where: { id: req.params.id, patientId },
  })
  if (!doc) {
    res.status(404).json({ error: 'Document not found' })
    return
  }
  res.json(mapDocument(doc, true, doc.fileData))
})

router.post('/documents', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const tenantId = req.auth!.tenantId
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
      patientId,
      docType: toDocType(body.docType),
      fileName: body.fileName,
      mimeType: body.mimeType,
      fileSize: bytes,
      fileData: body.fileData,
      uploadedBy: 'patient',
    },
  })

  res.status(201).json(mapDocument(doc))
})

router.delete('/documents/:id', requireAuth, requirePatient, async (req, res) => {
  const patientId = req.auth!.patientId!
  const doc = await prisma.patientDocument.findFirst({
    where: { id: req.params.id, patientId },
  })
  if (!doc) {
    res.status(404).json({ error: 'Document not found' })
    return
  }
  await prisma.patientDocument.delete({ where: { id: doc.id } })
  res.json({ ok: true })
})

export default router
