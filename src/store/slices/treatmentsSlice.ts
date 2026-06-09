import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Treatment } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState: [] as Treatment[],
  reducers: {
    addTreatment: (state, action: PayloadAction<Treatment>) => {
      state.unshift(action.payload)
    },
    updateTreatment: (state, action: PayloadAction<Treatment>) => {
      const idx = state.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
    syncTreatmentPatientName: (state, action: PayloadAction<{ patientId: string; name: string }>) => {
      for (const treatment of state) {
        if (treatment.patientId === action.payload.patientId) {
          treatment.patient = action.payload.name
        }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.treatments)
  },
})

export const { addTreatment, updateTreatment, syncTreatmentPatientName } = treatmentsSlice.actions
export default treatmentsSlice.reducer
