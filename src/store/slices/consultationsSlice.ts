import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ConsultationRecord } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState: [] as ConsultationRecord[],
  reducers: {
    saveConsultation: (state, action: PayloadAction<ConsultationRecord>) => {
      const idx = state.findIndex(c => c.appointmentId === action.payload.appointmentId)
      if (idx !== -1) state[idx] = action.payload
      else state.unshift(action.payload)
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.consultations)
  },
})

export const { saveConsultation } = consultationsSlice.actions
export default consultationsSlice.reducer
