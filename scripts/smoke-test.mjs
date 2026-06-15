#!/usr/bin/env node
/**
 * Feature smoke test — hits all API endpoints used by the frontend.
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:3001/api'
const EMAIL = 'admin@ayurvaflow.com'
const PASSWORD = 'Kairali123!'

const results = []

function pass(feature, detail) { results.push({ feature, status: 'PASS', detail }) }
function fail(feature, detail) { results.push({ feature, status: 'FAIL', detail }) }
function warn(feature, detail) { results.push({ feature, status: 'WARN', detail }) }

async function req(path, opts = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  const body = await res.json().catch(() => ({}))
  return { res, body }
}

async function main() {
  console.log(`\n🔍 Smoke test → ${BASE}\n`)

  // Health
  try {
    const { res, body } = await req('/health', { method: 'GET' })
    res.ok ? pass('Health check', body.status) : fail('Health check', `${res.status}`)
  } catch (e) {
    fail('Health check', e.message)
    printResults()
    process.exit(1)
  }

  // Auth — bad credentials
  const bad = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'x@x.com', password: 'wrong' }) })
  bad.res.status === 401 ? pass('Login rejects bad credentials', '401') : fail('Login rejects bad credentials', `${bad.res.status}`)

  // Auth — good credentials
  const login = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) })
  if (!login.res.ok) {
    fail('Login', login.body.error ?? login.res.status)
    printResults()
    process.exit(1)
  }
  const token = login.body.token
  pass('Login', `as ${login.body.user?.role} · ${login.body.user?.name}`)

  // Bootstrap
  const boot = await req('/bootstrap', {}, token)
  if (!boot.res.ok) {
    fail('Bootstrap data load', boot.body.error)
  } else {
    const b = boot.body
    pass('Bootstrap', `staff:${b.staff?.length} patients:${b.patients?.length} appts:${b.appointments?.length} treatments:${b.treatments?.length} invoices:${b.invoices?.length} consults:${b.consultations?.length}`)
    b.clinicSettings?.name ? pass('Bootstrap clinic settings', b.clinicSettings.name) : warn('Bootstrap clinic settings', 'missing')
    if (!b.staff?.length) warn('Bootstrap staff', 'empty')
    if (!b.patients?.length) warn('Bootstrap patients', 'empty')
  }

  const patientId = boot.body.patients?.[0]?.id
  const doctorName = boot.body.staff?.find(s => s.role === 'doctor')?.name ?? 'Dr. Arathi Menon'

  // Create patient
  const newPatient = await req('/patients', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Test Patient',
      age: 30,
      gender: 'M',
      phone: '9999900001',
      email: 'smoke@test.com',
      city: 'Kochi',
      referral: 'Walk-in',
      purpose: 'General checkup',
      prakriti: 'Vata',
    }),
  }, token)
  newPatient.res.status === 201 ? pass('Create patient', newPatient.body.id) : fail('Create patient', newPatient.body.error ?? newPatient.res.status)
  const testPatientId = newPatient.body.id ?? patientId
  const today = new Date().toISOString().slice(0, 10)
  const staffApptDay = new Date()
  staffApptDay.setDate(staffApptDay.getDate() + 40 + (Date.now() % 14))
  const staffApptDate = staffApptDay.toISOString().slice(0, 10)
  const staffReschedDay = new Date(staffApptDay)
  staffReschedDay.setDate(staffReschedDay.getDate() + 1)
  const staffReschedDate = staffReschedDay.toISOString().slice(0, 10)
  const uniq = Date.now() % 480
  const staffApptTime = `${String(9 + Math.floor(uniq / 60)).padStart(2, '0')}:${String(uniq % 60).padStart(2, '0')}`
  const reschedUniq = (uniq + 120) % 480
  const staffReschedTime = `${String(9 + Math.floor(reschedUniq / 60)).padStart(2, '0')}:${String(reschedUniq % 60).padStart(2, '0')}`

  const regForm = {
    regDate: today,
    firstName: 'SMOKE',
    lastName: 'TEST',
    dateOfBirth: '1990-01-15',
    ageYears: '36',
    ageMonths: '0',
    gender: 'M',
    mobile1: '9999900099',
    email: 'smoke.reg@test.com',
    city: 'Gurgaon',
    addressLine1: 'Sector 46',
    nationality: 'Indian',
    consentPart1Accepted: true,
    consentPart2Accepted: true,
    clauseAcknowledgements: Array(8).fill(true),
    patientSignature: 'data:image/png;base64,iVBORw0KGgo=',
    signerType: 'patient',
    visitPurpose: ['consultation'],
    hearAbout: ['website'],
    kin: { relation: 'father', relationOther: '', title: 'Mr.', titleOther: '', lastName: 'T', firstName: 'K', middleName: '', contactNo: '9999999999', emergencyContactNo: '9999999998' },
    officeUse: { diagnosis: '', presentComplaints: '', treatmentPrescribed: '', doctorSignature: '', filledAt: '', filledBy: '' },
  }
  const fullReg = await req('/patients/register', { method: 'POST', body: JSON.stringify({ formData: regForm }) }, token)
  fullReg.res.status === 201 && fullReg.body.registration?.regNumber?.startsWith('KACPL/')
    ? pass('One-time registration', fullReg.body.registration.regNumber)
    : fail('One-time registration', fullReg.body.error ?? fullReg.res.status)

  if (fullReg.body.registration?.patientId) {
    const getReg = await req(`/patients/${fullReg.body.registration.patientId}/registration`, {}, token)
    getReg.res.ok && getReg.body.regNumber
      ? pass('Get patient registration', getReg.body.regNumber)
      : fail('Get patient registration', getReg.body.error ?? getReg.res.status)

    const office = await req(`/patients/${fullReg.body.registration.patientId}/registration`, {
      method: 'PATCH',
      body: JSON.stringify({
        officeUse: {
          diagnosis: 'Test diagnosis',
          presentComplaints: 'Headache',
          treatmentPrescribed: 'Shirodhara',
          doctorSignature: 'Dr. Test',
          filledAt: today,
          filledBy: 'Smoke Test',
        },
      }),
    }, token)
    office.res.ok && office.body.formData?.officeUse?.diagnosis === 'Test diagnosis'
      ? pass('Update office-use block', 'diagnosis saved')
      : fail('Update office-use block', office.body.error ?? office.res.status)
  }

  const bootRegs = boot.body.registrations?.length ?? 0
  bootRegs >= 2 ? pass('Bootstrap registrations', `${bootRegs} seeded`) : warn('Bootstrap registrations', `only ${bootRegs}`)

  // Create appointment
  const appt = await req('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      doctor: doctorName,
      date: staffApptDate,
      time: staffApptTime,
      type: 'Consultation',
      duration: 45,
    }),
  }, token)
  appt.res.status === 201 ? pass('Create appointment', appt.body.id) : fail('Create appointment', appt.body.error ?? appt.res.status)

  // Update appointment status + reschedule + cancel
  if (appt.body.id) {
    const upd = await req(`/appointments/${appt.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'arrived' }),
    }, token)
    upd.res.ok && upd.body.status === 'arrived' ? pass('Update appointment status', 'arrived') : fail('Update appointment status', upd.body.error ?? upd.res.status)

    const resched = await req(`/appointments/${appt.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ date: staffReschedDate, time: staffReschedTime, doctor: doctorName }),
    }, token)
    resched.res.ok && resched.body.time === staffReschedTime ? pass('Reschedule appointment', resched.body.time) : fail('Reschedule appointment', resched.body.error ?? resched.res.status)
  }

  const cancelAppt = await req('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      doctor: doctorName,
      date: today,
      time: '18:00',
      type: 'Consultation',
      duration: 45,
    }),
  }, token)
  if (cancelAppt.body.id) {
    const cancelled = await req(`/appointments/${cancelAppt.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    }, token)
    cancelled.res.ok && cancelled.body.status === 'cancelled' ? pass('Cancel appointment', 'cancelled') : fail('Cancel appointment', cancelled.body.error ?? cancelled.res.status)
  }

  // Create treatment
  const treat = await req('/treatments', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      type: 'Abhyangam Wellness',
      condition: 'Stress relief',
      totalSessions: 3,
      durationDays: 3,
      startDate: today,
      endDate: today,
      doctor: doctorName,
      cost: 6000,
    }),
  }, token)
  treat.body?.id && (treat.res.status === 201 || treat.res.status === 200)
    ? pass('Assign treatment package', treat.body.id)
    : fail('Assign treatment package', treat.body.error ?? `HTTP ${treat.res.status} — restart server if route missing`)

  // Mark session complete
  if (treat.body.id) {
    const ts = await req(`/treatments/${treat.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'complete_session' }),
    }, token)
    ts.body?.completedSessions === 1 ? pass('Mark treatment session', `1/${ts.body.totalSessions}`) : fail('Mark treatment session', ts.body.error ?? `HTTP ${ts.res.status}`)
  }

  // Create consultation
  const consult = await req('/consultations', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      appointmentId: appt.body.id ?? '',
      complaints: 'Headache',
      condition: 'Vata imbalance',
      therapy: 'Shirodhara',
      prakriti: 'Vata',
    }),
  }, token)
  consult.res.status === 201 ? pass('Save consultation', consult.body.id) : fail('Save consultation', consult.body.error ?? consult.res.status)

  if (appt.body.id) {
    const consultUpd = await req('/consultations', {
      method: 'POST',
      body: JSON.stringify({
        patientId: testPatientId,
        appointmentId: appt.body.id,
        complaints: 'Updated headache',
        condition: 'Vata imbalance',
        therapy: 'Shirodhara',
        prakriti: 'Vata',
      }),
    }, token)
    consultUpd.res.ok && consultUpd.body.complaints === 'Updated headache'
      ? pass('Consultation upsert', consultUpd.body.id)
      : fail('Consultation upsert', consultUpd.body.error ?? consultUpd.res.status)
  }

  // Create invoice
  const inv = await req('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      date: today,
      items: [{ desc: 'Consultation', qty: 1, rate: 1500, amount: 1500 }],
      subtotal: 1500,
      tax: 270,
      total: 1770,
      paid: 1770,
    }),
  }, token)
  inv.res.status === 201 ? pass('Create invoice', `${inv.body.id} · ${inv.body.status}`) : fail('Create invoice', inv.body.error ?? inv.res.status)

  const partialInv = await req('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      patientId: testPatientId,
      date: today,
      items: [{ desc: 'Therapy', qty: 1, rate: 2000, amount: 2000 }],
      subtotal: 2000,
      tax: 360,
      total: 2360,
      paid: 0,
    }),
  }, token)
  if (partialInv.body.id) {
    const pay = await req(`/invoices/${partialInv.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ amount: 1000 }),
    }, token)
    pay.res.ok && pay.body.paid === 1000 && pay.body.status === 'partial'
      ? pass('Record partial payment', `₹${pay.body.paid}`)
      : fail('Record partial payment', pay.body.error ?? pay.res.status)
  }

  if (patientId) {
    const patUpd = await req(`/patients/${testPatientId}`, {
      method: 'PATCH',
      body: JSON.stringify({ city: 'Thiruvananthapuram' }),
    }, token)
    patUpd.res.ok && patUpd.body.city === 'Thiruvananthapuram'
      ? pass('Update patient', patUpd.body.id)
      : fail('Update patient', patUpd.body.error ?? patUpd.res.status)
  }

  const clinic = await req('/settings/clinic', {
    method: 'PATCH',
    body: JSON.stringify({
      name: 'Kairali Ayurvedic Centre',
      address: '42, Wellness Avenue',
      phone: '+91 495 123 4567',
      email: 'info@kairali.com',
      gst: '32AABCK0123A1Z5',
      openTime: '08:00',
      closeTime: '20:00',
      website: 'https://kairalicenters.com',
    }),
  }, token)
  clinic.res.ok ? pass('Save clinic settings', clinic.body.name) : fail('Save clinic settings', clinic.body.error ?? clinic.res.status)

  // Staff update (admin)
  const staffId = boot.body.staff?.[0]?.id
  if (staffId) {
    const st = await req(`/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify({ experience: 15 }),
    }, token)
    st.res.ok ? pass('Update staff (admin)', staffId) : fail('Update staff (admin)', st.body.error ?? st.res.status)
  }

  // Patient portal login
  const portalLogin = await req('/portal/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@email.com', password: PASSWORD }),
  })
  if (!portalLogin.res.ok) {
    fail('Patient portal login', portalLogin.body.error ?? portalLogin.res.status)
  } else {
    const pToken = portalLogin.body.token
    pass('Patient portal login', portalLogin.body.user?.name)

    const portalMe = await req('/portal/me', {}, pToken)
    portalMe.res.ok ? pass('Portal profile', portalMe.body.patient?.name) : fail('Portal profile', portalMe.body.error)

    const portalAppts = await req('/portal/appointments', {}, pToken)
    portalAppts.res.ok ? pass('Portal appointments', `${portalAppts.body?.length ?? 0} items`) : fail('Portal appointments', portalAppts.body.error)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 14)
    const bookDate = tomorrow.toISOString().slice(0, 10)
    const avail = await req(`/portal/availability?date=${bookDate}`, {}, pToken)
    if (avail.res.ok) {
      const doc = avail.body.doctors?.[0]
      const slot = doc?.availableSlots?.[0]
      pass('Portal availability', `${avail.body.doctors?.length ?? 0} doctors · ${doc?.availableSlots?.length ?? 0} slots`)
      if (doc && slot) {
        const booked = await req('/portal/appointments', {
          method: 'POST',
          body: JSON.stringify({ date: bookDate, time: slot, doctor: doc.name, type: 'Follow-up', paymentMethod: 'upi' }),
        }, pToken)
        booked.res.status === 201 && booked.body.confirmationId
          ? pass('Portal book + pay', `${booked.body.confirmationId} · ₹${booked.body.payment?.amount}`)
          : fail('Portal book + pay', booked.body.error ?? booked.res.status)
      } else {
        warn('Portal book appointment', 'no open slot to test')
      }
    } else {
      fail('Portal availability', avail.body.error ?? avail.res.status)
    }

    const portalDocs = await req('/portal/documents', {}, pToken)
    portalDocs.res.ok ? pass('Portal documents list', `${portalDocs.body?.length ?? 0} docs`) : fail('Portal documents list', portalDocs.body.error)

    const staffBlocked = await req('/bootstrap', {}, pToken)
    staffBlocked.res.status === 403 ? pass('Portal blocked from staff API', '403') : fail('Portal blocked from staff API', `${staffBlocked.res.status}`)
  }

  // Staff document upload for P001
  if (patientId) {
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    const docUp = await req(`/patients/${patientId}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        docType: 'other',
        fileName: 'smoke-test.png',
        mimeType: 'image/png',
        fileData: tinyPng,
      }),
    }, token)
    if (docUp.res.ok) {
      pass('Staff upload patient document', docUp.body.fileName)
      const docList = await req(`/patients/${patientId}/documents`, {}, token)
      docList.res.ok ? pass('Staff list patient documents', `${docList.body?.length ?? 0} docs`) : fail('Staff list patient documents', docList.body.error)
    } else {
      fail('Staff upload patient document', docUp.body.error ?? docUp.res.status)
    }
  }

  // Staff create blocked for non-admin — test with reception token if available
  const recLogin = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'reception@ayurvaflow.com', password: PASSWORD }) })
  if (recLogin.res.ok) {
    const recToken = recLogin.body.token
    const blocked = await req('/staff', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Staff', role: 'therapist', email: 'teststaff@test.com', phone: '9999999999', specialization: 'Test', experience: 1, status: 'active', joinDate: today }),
    }, recToken)
    blocked.res.status === 403 ? pass('Staff RBAC (reception blocked)', '403') : warn('Staff RBAC', `expected 403 got ${blocked.res.status}`)
  }

  printResults()
  const failed = results.filter(r => r.status === 'FAIL').length
  process.exit(failed > 0 ? 1 : 0)
}

function printResults() {
  console.log('─'.repeat(60))
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️ ' : '❌'
    console.log(`${icon} ${r.feature.padEnd(32)} ${r.detail}`)
  }
  const p = results.filter(r => r.status === 'PASS').length
  const f = results.filter(r => r.status === 'FAIL').length
  const w = results.filter(r => r.status === 'WARN').length
  console.log('─'.repeat(60))
  console.log(`\n${p} passed · ${f} failed · ${w} warnings\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
