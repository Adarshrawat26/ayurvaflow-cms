import { createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import type { RootState } from '../index'
import type { Appointment, ConsultationRecord, Invoice, Patient, StaffMember, Treatment, User } from '@/types/entities'
import type { PatientRegistrationRecord, RegistrationForm } from '@/types/registration'
import { api, ApiError } from '@/lib/api'
import { addPatient, updatePatient } from '../slices/patientsSlice'
import { addRegistration, updateRegistration } from '../slices/registrationsSlice'
import { addAppointment, updateAppointment } from '../slices/appointmentsSlice'
import { addInvoice, updateInvoice } from '../slices/invoicesSlice'
import { setClinicSettings } from '../slices/settingsSlice'
import type { ClinicSettings } from '@/types/clinic'
import { saveConsultation } from '../slices/consultationsSlice'
import { addStaff, updateStaff } from '../slices/staffSlice'
import { addTreatment, updateTreatment } from '../slices/treatmentsSlice'
import { syncPatientBalances } from '../slices/patientsSlice'

function getToken(state: RootState) {
  const token = state.auth.token
  if (!token) throw new Error('Not authenticated')
  return token
}

function errMsg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : e instanceof Error ? e.message : fallback
}

export const loginUser = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.login(email, password)
  } catch (e) {
    const msg = errMsg(e, 'Login failed')
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const loginPatientPortal = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string }
>('auth/portalLogin', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.portalLogin(email, password)
  } catch (e) {
    const msg = errMsg(e, 'Login failed')
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const signupPatientPortal = createAsyncThunk<
  { token: string; user: User },
  { name: string; email: string; phone: string; password: string }
>('auth/portalSignup', async (payload, { rejectWithValue }) => {
  try {
    return await api.portalSignup(payload)
  } catch (e) {
    const msg = errMsg(e, 'Sign-up failed')
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export { fetchBootstrap } from './bootstrap'

export const createPatientApi = createAsyncThunk<Patient, Omit<Patient, 'id'>>(
  'patients/create',
  async (patient, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const created = await api.createPatient(token, patient) as Patient
      dispatch(addPatient(created))
      toast.success(`${created.name} registered successfully`)
      return created
    } catch (e) {
      const msg = errMsg(e, 'Failed to register patient')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const registerPatientFormApi = createAsyncThunk<
  PatientRegistrationRecord,
  { form: RegistrationForm; patientId?: string }
>(
  'patients/registerForm',
  async ({ form, patientId }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const result = patientId
        ? await api.attachPatientRegistration(token, patientId, form)
        : await api.registerPatient(token, form)
      if (!patientId) dispatch(addPatient(result.patient))
      else dispatch(updatePatient(result.patient))
      dispatch(addRegistration(result.registration))
      toast.success(`Registered · ${result.registration.regNumber}`)
      return result.registration
    } catch (e) {
      const msg = errMsg(e, 'Failed to complete registration')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const updateRegistrationOfficeApi = createAsyncThunk<
  PatientRegistrationRecord,
  { patientId: string; officeUse: RegistrationForm['officeUse'] }
>(
  'registrations/officeUse',
  async ({ patientId, officeUse }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const updated = await api.updatePatientRegistration(token, patientId, { officeUse }) as PatientRegistrationRecord
      dispatch(updateRegistration(updated))
      toast.success('Office record updated')
      return updated
    } catch (e) {
      const msg = errMsg(e, 'Failed to update registration')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const createAppointmentApi = createAsyncThunk<Appointment, Omit<Appointment, 'id'>>(
  'appointments/create',
  async (appt, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const created = await api.createAppointment(token, appt) as Appointment
      dispatch(addAppointment(created))
      toast.success('Appointment booked')
      return created
    } catch (e) {
      const msg = errMsg(e, 'Failed to book appointment')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const updateAppointmentApi = createAsyncThunk<Appointment, Appointment>(
  'appointments/update',
  async (appt, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const updated = await api.updateAppointment(token, appt.id, {
        status: appt.status,
        date: appt.date,
        time: appt.time,
        doctor: appt.doctor,
        type: appt.type,
        duration: appt.duration,
      }) as Appointment
      dispatch(updateAppointment(updated))
      const msg = appt.status === 'cancelled'
        ? 'Appointment cancelled'
        : 'Appointment updated'
      toast.success(msg)
      return updated
    } catch (e) {
      const msg = errMsg(e, 'Failed to update appointment')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const updatePatientApi = createAsyncThunk<Patient, Patient>(
  'patients/update',
  async (patient, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const updated = await api.updatePatient(token, patient.id, patient) as Patient
      dispatch(updatePatient(updated))
      toast.success('Patient updated')
      return updated
    } catch (e) {
      const msg = errMsg(e, 'Failed to update patient')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const recordInvoicePaymentApi = createAsyncThunk<
  Invoice,
  { id: string; amount: number }
>(
  'invoices/payment',
  async ({ id, amount }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const updated = await api.recordInvoicePayment(token, id, { amount }) as Invoice
      dispatch(updateInvoice(updated))
      const data = await api.bootstrap(token)
      dispatch(syncPatientBalances(
        Object.fromEntries(data.patients.map(p => [p.id, p.balance]))
      ))
      toast.success('Payment recorded')
      return updated
    } catch (e) {
      const msg = errMsg(e, 'Failed to record payment')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const saveClinicSettingsApi = createAsyncThunk<ClinicSettings, ClinicSettings>(
  'settings/clinic',
  async (settings, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const saved = await api.saveClinicSettings(token, settings) as ClinicSettings
      dispatch(setClinicSettings(saved))
      toast.success('Clinic settings saved')
      return saved
    } catch (e) {
      const msg = errMsg(e, 'Failed to save clinic settings')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const changePasswordApi = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      await api.changePassword(token, currentPassword, newPassword)
      toast.success('Password updated')
    } catch (e) {
      const msg = errMsg(e, 'Failed to change password')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const createInvoiceApi = createAsyncThunk<Invoice, Invoice>(
  'invoices/create',
  async (invoice, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const created = await api.createInvoice(token, invoice) as Invoice
      dispatch(addInvoice(created))
      const data = await api.bootstrap(token)
      dispatch(syncPatientBalances(
        Object.fromEntries(data.patients.map(p => [p.id, p.balance]))
      ))
      toast.success('Invoice created')
      return created
    } catch (e) {
      const msg = errMsg(e, 'Failed to create invoice')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const saveConsultationApi = createAsyncThunk<ConsultationRecord, ConsultationRecord>(
  'consultations/save',
  async (record, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const saved = await api.saveConsultation(token, record) as ConsultationRecord
      dispatch(saveConsultation(saved))
      toast.success('Consultation saved')
      return saved
    } catch (e) {
      const msg = errMsg(e, 'Failed to save consultation')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const createTreatmentApi = createAsyncThunk<
  Treatment,
  {
    patientId: string
    type: string
    condition: string
    totalSessions: number
    durationDays: number
    startDate: string
    endDate: string
    doctor: string
    cost: number
  }
>(
  'treatments/create',
  async (data, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const created = await api.createTreatment(token, data) as Treatment
      dispatch(addTreatment(created))
      toast.success(`Treatment plan assigned to ${created.patient}`)
      return created
    } catch (e) {
      const msg = errMsg(e, 'Failed to assign treatment')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const updateTreatmentApi = createAsyncThunk<
  Treatment,
  { id: string; action?: 'complete_session'; completedSessions?: number }
>(
  'treatments/update',
  async ({ id, ...body }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      const updated = await api.updateTreatment(token, id, body) as Treatment
      dispatch(updateTreatment(updated))
      if (body.action === 'complete_session') {
        toast.success(
          updated.status === 'completed'
            ? 'Treatment programme completed!'
            : `Session ${updated.completedSessions} marked complete`,
        )
      }
      return updated
    } catch (e) {
      const msg = errMsg(e, 'Failed to update treatment')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const saveStaffApi = createAsyncThunk<StaffMember, { editId: string | null; data: Omit<StaffMember, 'id'> }>(
  'staff/save',
  async ({ editId, data }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState)
      if (editId) {
        const updated = await api.updateStaff(token, editId, data) as StaffMember
        dispatch(updateStaff(updated))
        toast.success('Staff member updated')
        return updated
      }
      const created = await api.createStaff(token, data) as StaffMember
      dispatch(addStaff(created))
      toast.success('Staff member added')
      return created
    } catch (e) {
      const msg = errMsg(e, 'Failed to save staff member')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)
