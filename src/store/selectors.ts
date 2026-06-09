import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { ClinicDataIndex } from '@/lib/clinicIndex'

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

export const selectClinicIndex = createSelector(
  selectPatients,
  selectAppointments,
  selectTreatments,
  selectInvoices,
  selectConsultations,
  selectRegistrations,
  selectStaff,
  (patients, appointments, treatments, invoices, consultations, registrations, staff) =>
    ClinicDataIndex.build({ patients, appointments, treatments, invoices, consultations, registrations, staff }),
)

export const selectRegistrationByPatientId = (patientId: string) =>
  createSelector(selectClinicIndex, i => i.getRegistration(patientId))

export const selectActiveDoctors = createSelector(selectStaff, staff =>
  staff
    .filter(s => s.role === 'doctor' && s.status === 'active')
    .map(s => ({ id: s.id, name: s.name, specialization: s.specialization, experience: s.experience, patients: 0, rating: 4.8 })),
)

export const selectTodayAppointments = createSelector(selectClinicIndex, i => i.getTodayAppointments())
export const selectConsultationQueue = createSelector(selectClinicIndex, i => i.getConsultationQueue())

export const selectDoctorsWithLoad = createSelector(selectActiveDoctors, selectClinicIndex, (doctors, index) => {
  const mk = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const loads = index.getDoctorMonthlyPatientCounts(doctors, mk)
  return doctors.map(d => ({ ...d, patients: loads.get(d.name) ?? 0 }))
})

export const selectConsultationByAppointmentId = (id: string) =>
  createSelector(selectClinicIndex, i => i.getConsultationForAppointment(id))

export const makeSelectPatientHistory = (patientId: string) =>
  createSelector(selectClinicIndex, i => i.getPatientHistory(patientId))

export const selectActiveTreatments = createSelector(selectTreatments, t => t.filter(x => x.status === 'active'))
export const selectOutstandingInvoices = createSelector(selectInvoices, invs => invs.filter(i => i.status !== 'paid'))

export const selectBillingSummary = createSelector(selectInvoices, invoices => ({
  totalRevenue: invoices.reduce((a, i) => a + i.paid, 0),
  totalOutstanding: invoices.reduce((a, i) => a + (i.total - i.paid), 0),
  count: invoices.length,
}))

export const selectPatientById = (id: string) => createSelector(selectClinicIndex, i => i.getPatient(id))
export const selectPatientSearchResults = (query: string) =>
  createSelector(selectClinicIndex, i => i.searchPatients(query))
export const selectStaffSearchResults = (query: string) =>
  createSelector(selectClinicIndex, i => i.searchStaff(query))
