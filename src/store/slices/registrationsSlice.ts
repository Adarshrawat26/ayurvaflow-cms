import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PatientRegistrationRecord } from '@/types/registration'
import { fetchBootstrap } from '../thunks/bootstrap'

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: [] as PatientRegistrationRecord[],
  reducers: {
    addRegistration: (state, action: PayloadAction<PatientRegistrationRecord>) => {
      const idx = state.findIndex(r => r.patientId === action.payload.patientId)
      if (idx !== -1) state[idx] = action.payload
      else state.unshift(action.payload)
    },
    updateRegistration: (state, action: PayloadAction<PatientRegistrationRecord>) => {
      const idx = state.findIndex(r => r.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.registrations ?? [])
  },
})

export const { addRegistration, updateRegistration } = registrationsSlice.actions
export default registrationsSlice.reducer
