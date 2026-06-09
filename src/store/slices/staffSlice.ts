import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { StaffMember } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

const staffSlice = createSlice({
  name: 'staff',
  initialState: [] as StaffMember[],
  reducers: {
    setStaff: (_state, action: PayloadAction<StaffMember[]>) => action.payload,
    addStaff: (state, action: PayloadAction<StaffMember>) => {
      state.unshift(action.payload)
    },
    updateStaff: (state, action: PayloadAction<StaffMember>) => {
      const idx = state.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
    toggleStaffStatus: (state, action: PayloadAction<string>) => {
      const member = state.find(s => s.id === action.payload)
      if (member) member.status = member.status === 'active' ? 'inactive' : 'active'
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.staff)
  },
})

export const { setStaff, addStaff, updateStaff, toggleStaffStatus } = staffSlice.actions
export default staffSlice.reducer
