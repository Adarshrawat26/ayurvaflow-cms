import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { toISODate } from '@/lib/dates'

export const selectAuth = (state: RootState) => state.auth ?? { user: null }
export const selectUser = (state: RootState) => state.auth?.user ?? null
export const selectStaff = (state: RootState) => state.staff ?? []
export const selectPatients = (state: RootState) => state.patients ?? []
export const selectAppointments = (state: RootState) => state.appointments ?? []
export const selectTreatments = (state: RootState) => state.treatments ?? []
export const selectInvoices = (state: RootState) => state.invoices ?? []
export const selectConsultations = (state: RootState) => state.consultations ?? []
export const selectClinicSettings = (state: RootState) => state.settings
export const selectRegistrations = (state: RootState) => state.registrations ?? []

export const selectRegistrationByPatientId = (patientId: string) =>
  createSelector(selectRegistrations, regs => regs.find(r => r.patientId === patientId))

export const selectActiveDoctors = createSelector(selectStaff, staff =>
  staff
    .filter(s => s.role === 'doctor' && s.status === 'active')
    .map(s => ({
      id: s.id,
      name: s.name,
      specialization: s.specialization,
      experience: s.experience,
      patients: 0,
      rating: 4.8,
    }))
)

export const selectTodayAppointments = createSelector(selectAppointments, appts => {
  const today = toISODate()
  return appts.filter(a => a.date === today).sort((a, b) => a.time.localeCompare(b.time))
})

export const selectConsultationQueue = createSelector(selectAppointments, appts => {
  const today = toISODate()
  return appts.filter(a =>
    a.date === today &&
    a.status !== 'completed' &&
    a.status !== 'cancelled' &&
    a.status !== 'no_show'
  )
})

export const selectDoctorsWithLoad = createSelector(selectActiveDoctors, selectAppointments, (doctors, appts) => {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return doctors.map(d => ({
    ...d,
    patients: new Set(
      appts
        .filter(a => a.doctor === d.name && a.date.startsWith(monthKey))
        .map(a => a.patientId)
    ).size,
  }))
})

export const selectConsultationByAppointmentId = (appointmentId: string) =>
  createSelector(selectConsultations, consults =>
    consults.find(c => c.appointmentId === appointmentId)
  )

export const makeSelectPatientHistory = (patientId: string) =>
  createSelector(
    selectAppointments,
    selectConsultations,
    selectTreatments,
    selectInvoices,
    (appts, consults, treatments, invoices) => ({
      appointments: appts
        .filter(a => a.patientId === patientId)
        .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
      consultations: consults
        .filter(c => c.patientId === patientId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      treatments: treatments
        .filter(t => t.patientId === patientId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
      invoices: invoices
        .filter(i => i.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    })
  )

export const selectActiveTreatments = createSelector(selectTreatments, t =>
  t.filter(x => x.status === 'active')
)

export const selectOutstandingInvoices = createSelector(selectInvoices, invs =>
  invs.filter(i => i.status !== 'paid')
)

export const selectBillingSummary = createSelector(selectInvoices, invoices => {
  const totalRevenue = invoices.reduce((a, i) => a + i.paid, 0)
  const totalOutstanding = invoices.reduce((a, i) => a + (i.total - i.paid), 0)
  return { totalRevenue, totalOutstanding, count: invoices.length }
})

export const selectPatientById = (id: string) =>
  createSelector(selectPatients, patients => patients.find(p => p.id === id))
