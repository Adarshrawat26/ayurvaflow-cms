import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Appointment, AppointmentStatus } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

const STATUS_ORDER: AppointmentStatus[] = ['scheduled', 'arrived', 'in_progress', 'completed', 'no_show']

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: [] as Appointment[],
  reducers: {
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.push(action.payload)
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const idx = state.findIndex(a => a.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
    advanceAppointmentStatus: (state, action: PayloadAction<string>) => {
      const appt = state.find(a => a.id === action.payload)
      if (!appt) return
      const idx = STATUS_ORDER.indexOf(appt.status)
      const next = STATUS_ORDER[idx + 1]
      if (next && next !== 'no_show') appt.status = next
    },
    markAppointmentNoShow: (state, action: PayloadAction<string>) => {
      const appt = state.find(a => a.id === action.payload)
      if (appt) appt.status = 'no_show'
    },
    syncAppointmentPatientName: (state, action: PayloadAction<{ patientId: string; name: string }>) => {
      for (const appt of state) {
        if (appt.patientId === action.payload.patientId) {
          appt.patient = action.payload.name
        }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.appointments)
  },
})

export const {
  addAppointment,
  updateAppointment,
  advanceAppointmentStatus,
  markAppointmentNoShow,
  syncAppointmentPatientName,
} = appointmentsSlice.actions
export default appointmentsSlice.reducer
