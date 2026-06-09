import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_CLINIC_SETTINGS, type ClinicSettings } from '@/types/clinic'
import { fetchBootstrap } from '../thunks/bootstrap'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: DEFAULT_CLINIC_SETTINGS as ClinicSettings,
  reducers: {
    setClinicSettings: (_state, action: PayloadAction<ClinicSettings>) => action.payload,
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (state, action) => {
      if (action.payload.clinicSettings) return action.payload.clinicSettings
      return state
    })
  },
})

export const { setClinicSettings } = settingsSlice.actions
export default settingsSlice.reducer
