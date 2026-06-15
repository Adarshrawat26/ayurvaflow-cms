import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import {
  fmtDate,
  fromApptStatus,
  num,
  toApptStatus,
  toGender,
  toInvoiceStatus,
  toTreatmentStatus,
} from '../lib/mappers.js'
import { mapRegistration } from '../lib/registration.js'
import { ALLOWED_MIME, mapDocument, MAX_FILE_BYTES, toDocType } from '../lib/documents.js'
import { hasSameDayConflict } from '../lib/intervals.js'
import { getPatientCareDoctor } from '../lib/patientDoctor.js'
import {
  bookingFeeQuote,
  PORTAL_PAYMENT_METHODS,
  type PortalPaymentMethod,
} from '../lib/bookingFees.js'
import { syncPatientBalance } from '../lib/patientBalance.js'
import {
  DEFAULT_DURATION,
  filterAvailableSlots,
  generateSlotTimes,
} from '../lib/slots.js'
import { requireAuth, requirePatient, signToken } from '../middleware/auth.js'
import { loginRateLimit } from '../middleware/rateLimit.js'

function parseClinicHours(tenant: { name: string; settings: unknown }) {
  const s = (tenant.settings ?? {}) as Record<string, string>
  return {
    openTime: s.openTime ?? '08:00',
    closeTime: s.closeTime ?? '20:00',
  }
}

function dayRange(dateISO: string) {
  const day = new Date(dateISO)
  const nextDay = new Date(day)
  nextDay.setDate(nextDay.getDate() + 1)
  return { day, nextDay }
}

const router = Router()

router.post('/auth/login', loginRateLimit, async (req, res) => {
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

  const settings = (patient.tenant.settings ?? {}) as Record<string, string>
  const careDoctor = await getPatientCareDoctor(patientId)

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
    isRegistered: !!patient.registration,
    clinicContact: {
      phone: settings.phone ?? '+91 8800661733',
      email: settings.email ?? '',
      address: settings.address ?? '',
    },
    registration: patient.registration ? mapRegistration(patient.registration) : null,
    careDoctor,
  })
})

router.get('/booking-fee', requireAuth, requirePatient, (_req, res) => {
  res.json(bookingFeeQuote())
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

router.get('/availability', requireAuth, requirePatient, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patientId = req.auth!.patientId!
  const dateISO = String(req.query.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
    return
  }

  const member = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { registration: true },
  })
  if (!member?.registration) {
    res.status(403).json({ error: 'Complete one-time registration at the centre before booking online' })
    return
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) {
    res.status(404).json({ error: 'Clinic not found' })
    return
  }

  const { openTime, closeTime } = parseClinicHours(tenant)
  const allSlots = generateSlotTimes(openTime, closeTime)
  const { day, nextDay } = dayRange(dateISO)

  const careDoctor = await getPatientCareDoctor(patientId)

  const [allDoctors, dayAppts, myAppts] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId, role: 'DOCTOR', isActive: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.appointment.findMany({
      where: {
        tenantId,
        date: { gte: day, lt: nextDay },
        status: { notIn: ['NO_SHOW', 'CANCELLED'] },
      },
      select: { id: true, doctorName: true, time: true, duration: true, patientId: true },
    }),
    prisma.appointment.findMany({
      where: {
        patientId,
        date: { gte: day, lt: nextDay },
        status: { notIn: ['NO_SHOW', 'CANCELLED'] },
      },
      orderBy: { time: 'asc' },
    }),
  ])

  const doctors = careDoctor
    ? allDoctors.filter(d => `${d.firstName} ${d.lastName}`.trim() === careDoctor)
    : allDoctors

  const doctorList = doctors
    .map(d => {
      const name = `${d.firstName} ${d.lastName}`.trim()
      const booked = dayAppts
        .filter(a => a.doctorName === name)
        .map(a => ({ time: a.time, duration: a.duration }))
      return {
        name,
        specialization: d.specialization ?? '',
        availableSlots: filterAvailableSlots(allSlots, booked, DEFAULT_DURATION, dateISO),
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)

  res.json({
    date: dateISO,
    openTime,
    closeTime,
    careDoctor,
    doctors: doctorList,
    myAppointments: myAppts.map(a => ({
      id: a.id,
      date: fmtDate(a.date),
      time: a.time,
      type: a.type,
      doctor: a.doctorName,
      status: toApptStatus(a.status),
      duration: a.duration,
    })),
  })
})

router.post('/appointments', requireAuth, requirePatient, async (req, res) => {
  const tenantId = req.auth!.tenantId
  const patientId = req.auth!.patientId!
  const body = req.body as {
    date?: string
    time?: string
    doctor?: string
    type?: string
    duration?: number
    paymentMethod?: string
  }

  if (!body.date || !body.time || !body.doctor) {
    res.status(400).json({ error: 'date, time, and doctor are required' })
    return
  }
  if (!body.paymentMethod || !PORTAL_PAYMENT_METHODS.includes(body.paymentMethod as PortalPaymentMethod)) {
    res.status(400).json({ error: 'Choose a payment method: upi, card, or netbanking' })
    return
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    res.status(400).json({ error: 'Invalid date format' })
    return
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { registration: true },
  })
  if (!patient?.registration) {
    res.status(403).json({ error: 'Complete one-time registration at the centre before booking online' })
    return
  }

  const type = body.type ?? 'Follow-up'
  if (type !== 'Follow-up') {
    res.status(400).json({ error: 'Registered members can only book follow-up visits online' })
    return
  }

  const duration = Number(body.duration) || DEFAULT_DURATION

  const careDoctor = await getPatientCareDoctor(patientId)
  const doctorName = careDoctor ?? body.doctor
  if (careDoctor && body.doctor !== careDoctor) {
    res.status(400).json({ error: `Please book with your doctor, ${careDoctor}` })
    return
  }

  const doctors = await prisma.user.findMany({
    where: { tenantId, role: 'DOCTOR', isActive: true },
  })
  const matched = doctors.find(d => `${d.firstName} ${d.lastName}`.trim() === doctorName)
  if (!matched) {
    res.status(400).json({ error: 'Your doctor is not available for online booking. Please call reception.' })
    return
  }

  const { day, nextDay } = dayRange(body.date)
  const sameDay = await prisma.appointment.findMany({
    where: {
      tenantId,
      doctorName: doctorName,
      date: { gte: day, lt: nextDay },
      status: { notIn: ['NO_SHOW', 'CANCELLED'] },
    },
    select: { id: true, time: true, duration: true },
  })

  if (hasSameDayConflict(sameDay, body.time, duration)) {
    res.status(409).json({ error: 'This slot is no longer available. Please pick another time.' })
    return
  }

  const patientConflict = await prisma.appointment.findFirst({
    where: {
      patientId,
      date: { gte: day, lt: nextDay },
      time: body.time,
      status: { notIn: ['NO_SHOW', 'CANCELLED'] },
    },
  })
  if (patientConflict) {
    res.status(409).json({ error: 'You already have an appointment at this time' })
    return
  }

  const count = await prisma.appointment.count({ where: { tenantId } })
  const apptId = `A${String(count + 1).padStart(3, '0')}`
  const appt = await prisma.appointment.create({
    data: {
      id: apptId,
      tenantId,
      patientId,
      doctorId: matched.id,
      doctorName: doctorName,
      date: day,
      time: body.time,
      type,
      status: fromApptStatus('scheduled'),
      duration,
    },
  })

  const fee = bookingFeeQuote()
  const invCount = await prisma.invoice.count({ where: { tenantId } })
  const txnId = `pay_${Date.now().toString(36)}`
  const inv = await prisma.invoice.create({
    data: {
      id: `INV${String(invCount + 1).padStart(3, '0')}`,
      tenantId,
      patientId,
      date: new Date(),
      items: [{
        desc: `${fee.label} — ${fmtDate(day)} ${body.time}`,
        qty: 1,
        rate: fee.subtotal,
        amount: fee.subtotal,
        paymentMethod: body.paymentMethod,
        txnId,
      }],
      subtotal: fee.subtotal,
      tax: fee.tax,
      total: fee.total,
      paid: fee.total,
      status: 'PAID',
    },
  })
  await syncPatientBalance(patientId)

  const confirmationId = `CFM-${apptId}-${txnId.slice(-6).toUpperCase()}`

  res.status(201).json({
    confirmationId,
    appointment: {
      id: appt.id,
      date: fmtDate(appt.date),
      time: appt.time,
      type: appt.type,
      doctor: appt.doctorName,
      status: toApptStatus(appt.status),
      duration: appt.duration,
    },
    payment: {
      method: body.paymentMethod,
      amount: fee.total,
      txnId,
      paidAt: new Date().toISOString(),
    },
    invoiceId: inv.id,
  })
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
