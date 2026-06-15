import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sampleRegistrationForm } from './seedRegistrations.js'

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== '1') {
  console.error('❌ Seeding is disabled in production.')
  console.error('   First-time Docker only: ALLOW_SEED=1 npm run db:seed')
  process.exit(1)
}

const prisma = new PrismaClient()

const DEFAULT_PASSWORD = 'Kairali123!'

function dateOffset(days: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

const LOGIN_USERS = [
  { email: 'admin@ayurvaflow.com', role: 'ADMIN' as const, firstName: 'Vikram', lastName: 'Nair', phone: '9876540001' },
  { email: 'reception@ayurvaflow.com', role: 'RECEPTIONIST' as const, firstName: 'Deepa', lastName: 'Pillai', phone: '9876540002' },
  { email: 'doctor@ayurvaflow.com', role: 'DOCTOR' as const, firstName: 'Dr. Arathi', lastName: 'Menon', phone: '9876540003', specialization: 'Panchakarma & Detox', experience: 14 },
  { email: 'therapist@ayurvaflow.com', role: 'THERAPIST' as const, firstName: 'Arun', lastName: 'Krishnan', phone: '9876540006', specialization: 'Abhyangam & Shirodhara', experience: 6 },
]

const STAFF_EXTRA = [
  { id: 'S004', email: 'manjusha@kairali.com', role: 'DOCTOR' as const, firstName: 'Dr. Manjusha', lastName: 'Mohan', specialization: 'Skin Disorders & Rasayana', experience: 11, phone: '9876540004' },
  { id: 'S005', email: 'pratibha@kairali.com', role: 'DOCTOR' as const, firstName: 'Dr. Pratibha', lastName: 'Nair', specialization: 'Neurological & Pain Management', experience: 9, phone: '9876540005' },
  { id: 'S007', email: 'sujatha@kairali.com', role: 'THERAPIST' as const, firstName: 'Sujatha', lastName: 'Varma', specialization: 'Pizhichil & Navarakizhi', experience: 7, phone: '9876540007' },
]

const PATIENTS = [
  { id: 'P001', name: 'Priya Sharma', age: 34, gender: 'F' as const, phone: '9876543210', email: 'priya@email.com', city: 'Mumbai', referral: 'Online', purpose: 'Stress & Anxiety', prakriti: 'Vata', status: 'ACTIVE' as const, lastVisit: '2024-01-10', balance: 0, occupation: 'Software Engineer', nationality: 'Indian' },
  { id: 'P002', name: 'Raj Mehta', age: 45, gender: 'M' as const, phone: '9876543211', email: 'raj@email.com', city: 'Delhi', referral: 'Doctor Referral', purpose: 'Pain Management', prakriti: 'Pitta', status: 'ACTIVE' as const, lastVisit: '2024-01-09', balance: 26700, occupation: 'Business Owner', nationality: 'Indian' },
  { id: 'P003', name: 'Anita Nair', age: 28, gender: 'F' as const, phone: '9876543212', email: 'anita@email.com', city: 'Kochi', referral: 'Online', purpose: 'Skin Disorders', prakriti: 'Pitta-Kapha', status: 'ACTIVE' as const, lastVisit: '2024-01-08', balance: 0, occupation: 'Teacher', nationality: 'Indian' },
  { id: 'P004', name: 'James Wilson', age: 52, gender: 'M' as const, phone: '9876543213', email: 'james@email.com', city: 'Bangalore', referral: 'Friend / Family', purpose: 'Panchakarma / Detox', prakriti: 'Vata-Pitta', status: 'ACTIVE' as const, lastVisit: '2024-01-07', balance: 0, occupation: 'Consultant', nationality: 'British' },
  { id: 'P005', name: 'Meera Pillai', age: 39, gender: 'F' as const, phone: '9876543214', email: 'meera@email.com', city: 'Chennai', referral: 'Doctor Referral', purpose: 'Hypertension', prakriti: 'Pitta', status: 'COMPLETED' as const, lastVisit: '2023-12-20', balance: 0, occupation: 'Doctor', nationality: 'Indian' },
  { id: 'P006', name: 'David Chen', age: 41, gender: 'M' as const, phone: '9876543215', email: 'david@email.com', city: 'Hyderabad', referral: 'Online', purpose: 'Weight Management', prakriti: 'Kapha', status: 'ACTIVE' as const, lastVisit: '2024-01-06', balance: 13276, occupation: 'Engineer', nationality: 'Singaporean' },
  { id: 'P007', name: 'Kavya Reddy', age: 31, gender: 'F' as const, phone: '9876543216', email: 'kavya@email.com', city: 'Pune', referral: 'Walk-in', purpose: 'Pain Management', prakriti: 'Vata', status: 'ACTIVE' as const, lastVisit: '2024-01-05', balance: 0, occupation: 'Architect', nationality: 'Indian' },
  { id: 'P008', name: 'Ahmed Al-Rashid', age: 55, gender: 'M' as const, phone: '9876543217', email: 'ahmed@email.com', city: 'Goa', referral: 'Travel Agent', purpose: 'Rejuvenation', prakriti: 'Pitta-Kapha', status: 'ACTIVE' as const, lastVisit: '2024-01-04', balance: 100300, occupation: 'Executive', nationality: 'UAE' },
]

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.consultation.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.treatmentPlan.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patientDocument.deleteMany()
  await prisma.patientRegistration.deleteMany()
  await prisma.patientAccount.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant-kairali',
      name: 'Kairali Ayurvedic Centre',
      subdomain: 'kairali',
      plan: 'GROWTH',
      status: 'ACTIVE',
      settings: {
        address: '3056 P, Sector 46, Gurgaon 122033',
        phone: '+91 8800661733',
        email: 'gurgaon@kairalicentres.com',
        gst: '32AABCK0123A1Z5',
        openTime: '08:00',
        closeTime: '20:00',
        website: 'https://kairalicenters.com',
      },
    },
  })

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const u of LOGIN_USERS) {
    await prisma.user.create({
      data: {
        id: `U-${u.role}`,
        tenantId: tenant.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: u.phone,
        specialization: u.specialization ?? null,
        experience: u.experience ?? 0,
        joinDate: new Date('2020-01-01'),
      },
    })
  }

  for (const s of STAFF_EXTRA) {
    await prisma.user.create({
      data: {
        id: s.id,
        tenantId: tenant.id,
        email: s.email,
        passwordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        role: s.role,
        phone: s.phone,
        specialization: s.specialization,
        experience: s.experience,
        joinDate: new Date('2019-01-01'),
      },
    })
  }

  for (const p of PATIENTS) {
    await prisma.patient.create({
      data: {
        id: p.id,
        tenantId: tenant.id,
        patientCode: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        city: p.city,
        occupation: p.occupation,
        nationality: p.nationality,
        referralSource: p.referral,
        purpose: p.purpose,
        prakriti: p.prakriti,
        status: p.status,
        balance: p.balance,
        lastVisit: new Date(p.lastVisit),
      },
    })
  }

  const today = dateOffset(0)
  const tomorrow = dateOffset(1)

  const appointments = [
    { id: 'A001', patientId: 'P001', doctor: 'Dr. Arathi Menon', date: today, time: '09:00', type: 'Consultation', status: 'SCHEDULED' as const, duration: 45 },
    { id: 'A002', patientId: 'P002', doctor: 'Dr. Pratibha Nair', date: today, time: '10:00', type: 'Elakizhi', status: 'ARRIVED' as const, duration: 60 },
    { id: 'A003', patientId: 'P003', doctor: 'Dr. Manjusha Mohan', date: today, time: '11:00', type: 'Follow-up', status: 'IN_PROGRESS' as const, duration: 45 },
    { id: 'A004', patientId: 'P004', doctor: 'Dr. Arathi Menon', date: today, time: '12:00', type: 'Panchakarma', status: 'COMPLETED' as const, duration: 90 },
    { id: 'A005', patientId: 'P005', doctor: 'Dr. Manjusha Mohan', date: today, time: '14:00', type: 'Consultation', status: 'SCHEDULED' as const, duration: 45 },
    { id: 'A006', patientId: 'P006', doctor: 'Dr. Arathi Menon', date: tomorrow, time: '09:30', type: 'Udhwarthanam', status: 'SCHEDULED' as const, duration: 60 },
    { id: 'A007', patientId: 'P007', doctor: 'Dr. Pratibha Nair', date: tomorrow, time: '10:30', type: 'Navarakizhi', status: 'SCHEDULED' as const, duration: 60 },
    { id: 'A008', patientId: 'P008', doctor: 'Dr. Arathi Menon', date: tomorrow, time: '11:30', type: 'Pizhichil', status: 'SCHEDULED' as const, duration: 90 },
  ]

  for (const a of appointments) {
    await prisma.appointment.create({
      data: {
        id: a.id,
        tenantId: tenant.id,
        patientId: a.patientId,
        doctorName: a.doctor,
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status,
        duration: a.duration,
      },
    })
  }

  const treatments = [
    { id: 'T001', patientId: 'P001', type: 'Shirodhara', condition: 'Stress & Anxiety', totalSessions: 14, completedSessions: 8, startDate: '2024-01-01', endDate: '2024-01-21', doctor: 'Dr. Arathi Menon', status: 'ACTIVE' as const, cost: 28000 },
    { id: 'T002', patientId: 'P002', type: 'Panchakarma', condition: 'Pain Management', totalSessions: 21, completedSessions: 12, startDate: '2023-12-20', endDate: '2024-01-20', doctor: 'Dr. Pratibha Nair', status: 'ACTIVE' as const, cost: 65000 },
    { id: 'T003', patientId: 'P003', type: 'Nasyam', condition: 'Skin Disorders', totalSessions: 7, completedSessions: 3, startDate: '2024-01-05', endDate: '2024-01-15', doctor: 'Dr. Manjusha Mohan', status: 'ACTIVE' as const, cost: 18000 },
    { id: 'T004', patientId: 'P004', type: 'Pizhichil', condition: 'Panchakarma / Detox', totalSessions: 10, completedSessions: 10, startDate: '2023-12-01', endDate: '2023-12-15', doctor: 'Dr. Arathi Menon', status: 'COMPLETED' as const, cost: 42000 },
    { id: 'T005', patientId: 'P008', type: 'Rasayana', condition: 'Rejuvenation', totalSessions: 28, completedSessions: 5, startDate: '2024-01-08', endDate: '2024-02-10', doctor: 'Dr. Manjusha Mohan', status: 'ACTIVE' as const, cost: 85000 },
    { id: 'T006', patientId: 'P006', type: 'Veda Diet Program', condition: 'Weight Management', totalSessions: 30, completedSessions: 6, startDate: '2024-01-06', endDate: '2024-02-15', doctor: 'Dr. Arathi Menon', status: 'ACTIVE' as const, cost: 35000 },
  ]

  for (const t of treatments) {
    await prisma.treatmentPlan.create({
      data: {
        id: t.id,
        tenantId: tenant.id,
        patientId: t.patientId,
        type: t.type,
        condition: t.condition,
        totalSessions: t.totalSessions,
        completedSessions: t.completedSessions,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        doctorName: t.doctor,
        status: t.status,
        cost: t.cost,
      },
    })
  }

  const invoices = [
    { id: 'INV001', patientId: 'P001', date: '2024-01-10', items: [{ desc: 'Shirodhara (8 sessions)', qty: 8, rate: 2000, amount: 16000 }, { desc: 'Herbal Medicines', qty: 1, rate: 3500, amount: 3500 }], subtotal: 19500, tax: 3510, total: 23010, paid: 23010, status: 'PAID' as const },
    { id: 'INV002', patientId: 'P002', date: '2024-01-09', items: [{ desc: 'Panchakarma Package (21 sessions)', qty: 1, rate: 65000, amount: 65000 }], subtotal: 65000, tax: 11700, total: 76700, paid: 50000, status: 'PARTIAL' as const },
    { id: 'INV003', patientId: 'P004', date: '2024-01-07', items: [{ desc: 'Pizhichil (10 sessions)', qty: 10, rate: 4200, amount: 42000 }, { desc: 'Initial Consultation', qty: 1, rate: 1500, amount: 1500 }], subtotal: 43500, tax: 7830, total: 51330, paid: 51330, status: 'PAID' as const },
    { id: 'INV004', patientId: 'P008', date: '2024-01-08', items: [{ desc: 'Rasayana Programme (28 sessions)', qty: 1, rate: 85000, amount: 85000 }], subtotal: 85000, tax: 15300, total: 100300, paid: 0, status: 'UNPAID' as const },
    { id: 'INV005', patientId: 'P006', date: '2024-01-06', items: [{ desc: 'Veda Diet Program', qty: 1, rate: 15000, amount: 15000 }, { desc: 'Udhwarthanam (6 sessions)', qty: 6, rate: 2200, amount: 13200 }], subtotal: 28200, tax: 5076, total: 33276, paid: 20000, status: 'PARTIAL' as const },
  ]

  for (const inv of invoices) {
    await prisma.invoice.create({
      data: {
        id: inv.id,
        tenantId: tenant.id,
        patientId: inv.patientId,
        date: new Date(inv.date),
        items: inv.items,
        subtotal: inv.subtotal,
        tax: inv.tax,
        total: inv.total,
        paid: inv.paid,
        status: inv.status,
      },
    })
  }

  const year = new Date().getFullYear()
  const seededRegs = [
    {
      patientId: 'P001',
      regNumber: `KACPL/${year}/001/GRG`,
      form: sampleRegistrationForm({
        firstName: 'Priya',
        lastName: 'Sharma',
        dateOfBirth: '1990-05-12',
        ageYears: '34',
        gender: 'F',
        mobile1: '9876543210',
        email: 'priya@email.com',
        city: 'Gurgaon',
        occupation: 'Software Engineer',
        nationality: 'Indian',
        addressLine1: '3056 P Sector 46',
        visitPurpose: ['consultation', 'maintenance'],
        hearAbout: ['website'],
      }),
    },
    {
      patientId: 'P002',
      regNumber: `KACPL/${year}/002/GRG`,
      form: sampleRegistrationForm({
        firstName: 'Raj',
        lastName: 'Mehta',
        dateOfBirth: '1979-03-22',
        ageYears: '45',
        gender: 'M',
        mobile1: '9876543211',
        email: 'raj@email.com',
        city: 'Delhi',
        occupation: 'Business Owner',
        nationality: 'Indian',
        addressLine1: '12 Connaught Place',
        visitPurpose: ['consultation'],
        hearAbout: ['social'],
      }),
    },
  ]

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@ayurvaflow.com' } })
  for (const r of seededRegs) {
    await prisma.patientRegistration.create({
      data: {
        tenantId: tenant.id,
        patientId: r.patientId,
        regNumber: r.regNumber,
        formData: r.form,
        patientSignature: r.form.patientSignature,
        signerType: 'patient',
        signedAt: new Date(),
        signedByUserId: adminUser?.id ?? null,
      },
    })
  }

  const sampleImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  const portalPatients = [
    { patientId: 'P001', email: 'priya@email.com' },
    { patientId: 'P002', email: 'raj@email.com' },
    { patientId: 'P003', email: 'anita@email.com' },
  ]

  for (const p of portalPatients) {
    await prisma.patientAccount.create({
      data: {
        tenantId: tenant.id,
        patientId: p.patientId,
        email: p.email,
        passwordHash,
      },
    })
  }

  await prisma.patientDocument.createMany({
    data: [
      {
        tenantId: tenant.id,
        patientId: 'P001',
        docType: 'AADHAAR',
        fileName: 'priya-aadhaar.png',
        mimeType: 'image/png',
        fileSize: 68,
        fileData: sampleImage,
        uploadedBy: 'admin@ayurvaflow.com',
      },
      {
        tenantId: tenant.id,
        patientId: 'P001',
        docType: 'PAN',
        fileName: 'priya-pan.png',
        mimeType: 'image/png',
        fileSize: 68,
        fileData: sampleImage,
        uploadedBy: 'priya@email.com',
      },
    ],
  })

  console.log('✅ Seed complete')
  console.log(`   Sample registrations: ${seededRegs.length} (P001, P002)`)
  console.log(`   Patient portal accounts: ${portalPatients.map(p => p.email).join(', ')}`)
  console.log(`   Tenant: ${tenant.name}`)
  console.log(`   Login password for all users: ${DEFAULT_PASSWORD}`)
  console.log('   Staff accounts:')
  for (const u of LOGIN_USERS) console.log(`     ${u.email} (${u.role})`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
