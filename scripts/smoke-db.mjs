#!/usr/bin/env node
/**
 * Database smoke test — schema, migrations, seed integrity.
 * Usage: node scripts/smoke-db.mjs
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const results = []

function pass(feature, detail) { results.push({ feature, status: 'PASS', detail }) }
function fail(feature, detail) { results.push({ feature, status: 'FAIL', detail }) }
function warn(feature, detail) { results.push({ feature, status: 'WARN', detail }) }

async function main() {
  console.log('\n🗄️  DB smoke test\n')

  try {
    await prisma.$queryRaw`SELECT 1`
    pass('Database connection', 'SQLite reachable')
  } catch (e) {
    fail('Database connection', e.message)
    printResults()
    process.exit(1)
  }

  try {
    const migrations = await prisma.$queryRaw`SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at`
    const names = migrations.map(m => m.migration_name)
    if (names.length) {
      pass('Migrations applied', `${names.length} migration(s)`)
    } else {
      warn('Migrations applied', 'none — OK if deployed via prisma db push')
    }
    if (!names.some(n => n.includes('patient_registration'))) {
      warn('Registration migration', 'patient_registrations migration not found')
    }
  } catch {
    warn('Migrations table', 'using db push — run migrate deploy on fresh prod')
  }

  const tenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } })
  tenant ? pass('Active tenant', tenant.name) : fail('Active tenant', 'none found')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', isActive: true } })
  admin ? pass('Admin user', admin.email) : fail('Admin user', 'none found')

  const doctors = await prisma.user.count({ where: { role: 'DOCTOR', isActive: true } })
  doctors >= 1 ? pass('Doctors', `${doctors} active`) : fail('Doctors', 'need at least 1')

  const patients = await prisma.patient.count()
  patients >= 1 ? pass('Patients', `${patients} records`) : fail('Patients', 'empty')

  const registrations = await prisma.patientRegistration.count()
  registrations >= 1 ? pass('Registrations', `${registrations} signed`) : warn('Registrations', 'none — registration flow untested in DB')

  const portalAccounts = await prisma.patientAccount.count({ where: { isActive: true } })
  portalAccounts >= 1 ? pass('Patient portal accounts', `${portalAccounts} active`) : warn('Patient portal accounts', 'none')

  const appts = await prisma.appointment.count()
  appts >= 1 ? pass('Appointments', `${appts} records`) : warn('Appointments', 'empty')

  const invoices = await prisma.invoice.count()
  invoices >= 1 ? pass('Invoices', `${invoices} records`) : warn('Invoices', 'empty')

  try {
    const orphans = await prisma.$queryRaw`
      SELECT a.id FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE p.id IS NULL LIMIT 1`
    orphans.length === 0
      ? pass('Appointment FK integrity', 'no orphans')
      : fail('Appointment FK integrity', `${orphans.length} orphan(s)`)
  } catch {
    warn('Appointment FK integrity', 'skipped')
  }

  const regWithPatient = await prisma.patientRegistration.findFirst({
    include: { patient: true },
  })
  if (regWithPatient?.patient) {
    pass('Registration → patient link', regWithPatient.regNumber)
  } else if (registrations > 0) {
    fail('Registration → patient link', 'broken')
  }

  const portalLinked = await prisma.patientAccount.findFirst({
    where: { isActive: true },
    include: { patient: { include: { registration: true } } },
  })
  if (portalLinked) {
    pass('Portal account → patient', portalLinked.email)
    if (portalLinked.patient.registration) {
      pass('Portal member registration', portalLinked.patient.registration.regNumber)
    }
  }

  if (process.env.JWT_SECRET?.includes('dev') || process.env.JWT_SECRET?.includes('change')) {
    warn('JWT_SECRET', 'still looks like a dev default — change before prod')
  } else if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    pass('JWT_SECRET length', `${process.env.JWT_SECRET.length} chars`)
  } else {
    warn('JWT_SECRET', 'set a strong secret (32+ chars) for production')
  }

  printResults()
  const failed = results.filter(r => r.status === 'FAIL').length
  process.exit(failed > 0 ? 1 : 0)
}

function printResults() {
  console.log('─'.repeat(56))
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${r.feature.padEnd(28)} ${r.detail}`)
  }
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length
  console.log('─'.repeat(56))
  console.log(`\n${passed} passed · ${failed} failed · ${warnings} warnings\n`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
