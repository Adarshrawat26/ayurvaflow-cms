import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Patient } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

const patientsSlice = createSlice({
  name: 'patients',
  initialState: [] as Patient[],
  reducers: {
    addPatient: (state, action: PayloadAction<Patient>) => {
      state.unshift(action.payload)
    },
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const idx = state.findIndex(p => p.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
    updatePatientBalance: (state, action: PayloadAction<{ patientId: string; balance: number }>) => {
      const patient = state.find(p => p.id === action.payload.patientId)
      if (patient) patient.balance = action.payload.balance
    },
    syncPatientBalances: (state, action: PayloadAction<Record<string, number>>) => {
      for (const patient of state) {
        if (action.payload[patient.id] !== undefined) {
          patient.balance = action.payload[patient.id]
        }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.patients)
  },
})

export const { addPatient, updatePatient, updatePatientBalance, syncPatientBalances } = patientsSlice.actions
export default patientsSlice.reducer
