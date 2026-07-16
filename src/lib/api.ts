import type { Role, User } from '@/types/entities'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await res.text()

  let body: { error?: string }
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    const staleApi = text.trimStart().startsWith('<!')
    throw new ApiError(
      res.status || 502,
      staleApi
        ? 'Cannot reach the API server. Run `npm run dev` in the project folder, then refresh this page.'
        : 'Invalid response from server',
    )
  }

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'Request failed')
  }

  return body as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User & { role: Role } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  bootstrap: (token: string) =>
    request<{
      staff: import('@/types/entities').StaffMember[]
      patients: import('@/types/entities').Patient[]
      appointments: import('@/types/entities').Appointment[]
      treatments: import('@/types/entities').Treatment[]
      invoices: import('@/types/entities').Invoice[]
      consultations: import('@/types/entities').ConsultationRecord[]
      clinicSettings?: import('@/types/clinic').ClinicSettings
      registrations?: import('@/types/registration').PatientRegistrationRecord[]
    }>('/bootstrap', {}, token),

  createPatient: (token: string, data: unknown) =>
    request('/patients', { method: 'POST', body: JSON.stringify(data) }, token),

  registerPatient: (token: string, formData: unknown) =>
    request<{ patient: import('@/types/entities').Patient; registration: import('@/types/registration').PatientRegistrationRecord }>(
      '/patients/register',
      { method: 'POST', body: JSON.stringify({ formData }) },
      token,
    ),

  attachPatientRegistration: (token: string, patientId: string, formData: unknown) =>
    request<{ patient: import('@/types/entities').Patient; registration: import('@/types/registration').PatientRegistrationRecord }>(
      `/patients/${patientId}/registration`,
      { method: 'POST', body: JSON.stringify({ formData }) },
      token,
    ),

  getPatientRegistration: (token: string, patientId: string) =>
    request<import('@/types/registration').PatientRegistrationRecord>(`/patients/${patientId}/registration`, {}, token),

  updatePatientRegistration: (token: string, patientId: string, data: unknown) =>
    request(`/patients/${patientId}/registration`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  createAppointment: (token: string, data: unknown) =>
    request('/appointments', { method: 'POST', body: JSON.stringify(data) }, token),

  updateAppointment: (token: string, id: string, data: unknown) =>
    request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  createInvoice: (token: string, data: unknown) =>
    request('/invoices', { method: 'POST', body: JSON.stringify(data) }, token),

  saveConsultation: (token: string, data: unknown) =>
    request('/consultations', { method: 'POST', body: JSON.stringify(data) }, token),

  createStaff: (token: string, data: unknown) =>
    request('/staff', { method: 'POST', body: JSON.stringify(data) }, token),

  updateStaff: (token: string, id: string, data: unknown) =>
    request(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  createTreatment: (token: string, data: unknown) =>
    request('/treatments', { method: 'POST', body: JSON.stringify(data) }, token),

  updateTreatment: (token: string, id: string, data: unknown) =>
    request(`/treatments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  updatePatient: (token: string, id: string, data: unknown) =>
    request(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  recordInvoicePayment: (token: string, id: string, data: { amount?: number; paid?: number }) =>
    request(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  saveClinicSettings: (token: string, data: unknown) =>
    request('/settings/clinic', { method: 'PATCH', body: JSON.stringify(data) }, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, token),

  listPatientDocuments: (token: string, patientId: string) =>
    request<import('@/types/documents').PatientDocument[]>(`/patients/${patientId}/documents`, {}, token),

  getPatientDocument: (token: string, patientId: string, docId: string) =>
    request<import('@/types/documents').PatientDocument>(`/patients/${patientId}/documents/${docId}`, {}, token),

  uploadPatientDocument: (token: string, patientId: string, data: unknown) =>
    request<import('@/types/documents').PatientDocument>(`/patients/${patientId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  deletePatientDocument: (token: string, patientId: string, docId: string) =>
    request(`/patients/${patientId}/documents/${docId}`, { method: 'DELETE' }, token),

  portalLogin: (email: string, password: string) =>
    request<{ token: string; user: User & { role: 'patient'; patientId: string; email: string } }>('/portal/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  portalSignup: (data: { name: string; email: string; phone: string; password: string }) =>
    request<{ token: string; user: User & { role: 'patient'; patientId: string; email: string } }>('/portal/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  portalMe: (token: string) =>
    request<{
      patient: { name: string; phone: string; email: string; city: string; balance: number; prakriti: string; purpose: string }
      clinic: string
      isRegistered: boolean
      clinicContact: { phone: string; email: string; address: string }
      registration: import('@/types/registration').PatientRegistrationRecord | null
      careDoctor: string | null
    }>('/portal/me', {}, token),

  portalSubmitRegistration: (token: string, formData: import('@/types/registration').RegistrationForm) =>
    request<{ registration: import('@/types/registration').PatientRegistrationRecord }>('/portal/registration', {
      method: 'POST',
      body: JSON.stringify({ formData }),
    }, token),

  portalAppointments: (token: string) =>
    request<import('@/types/entities').Appointment[]>('/portal/appointments', {}, token),

  portalAvailability: (token: string, date: string) =>
    request<{
      date: string
      openTime: string
      closeTime: string
      doctors: { name: string; specialization: string; availableSlots: string[] }[]
      myAppointments: import('@/types/entities').Appointment[]
    }>(`/portal/availability?date=${encodeURIComponent(date)}`, {}, token),

  portalBookingFee: (token: string) =>
    request<{
      label: string
      subtotal: number
      tax: number
      total: number
      currency: string
    }>('/portal/booking-fee', {}, token),

  portalBookAppointment: (token: string, data: {
    date: string
    time: string
    doctor: string
    type?: string
    duration?: number
    paymentMethod: import('@/lib/booking').PortalPaymentMethod
  }) =>
    request<import('@/lib/booking').BookingConfirmation>('/portal/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  portalTreatments: (token: string) =>
    request<import('@/types/entities').Treatment[]>('/portal/treatments', {}, token),

  portalInvoices: (token: string) =>
    request<import('@/types/entities').Invoice[]>('/portal/invoices', {}, token),

  portalListDocuments: (token: string) =>
    request<import('@/types/documents').PatientDocument[]>('/portal/documents', {}, token),

  portalGetDocument: (token: string, docId: string) =>
    request<import('@/types/documents').PatientDocument>(`/portal/documents/${docId}`, {}, token),

  portalUploadDocument: (token: string, data: unknown) =>
    request<import('@/types/documents').PatientDocument>('/portal/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  portalDeleteDocument: (token: string, docId: string) =>
    request(`/portal/documents/${docId}`, { method: 'DELETE' }, token),

  getSlots: (token: string, doctor: string, date: string) =>
    request<{ available: string[] }>(`/slots?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`, {}, token),
}
