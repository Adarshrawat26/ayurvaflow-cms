import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Invoice } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'

function invoiceStatus(total: number, paid: number): Invoice['status'] {
  if (paid >= total) return 'paid'
  if (paid > 0) return 'partial'
  return 'unpaid'
}

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: [] as Invoice[],
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.unshift(action.payload)
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const idx = state.findIndex(i => i.id === action.payload.id)
      if (idx !== -1) state[idx] = action.payload
    },
    recordPayment: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const inv = state.find(i => i.id === action.payload.id)
      if (!inv) return
      inv.paid = Math.min(inv.total, inv.paid + action.payload.amount)
      inv.status = invoiceStatus(inv.total, inv.paid)
    },
    syncInvoicePatientName: (state, action: PayloadAction<{ patientId: string; name: string }>) => {
      for (const inv of state) {
        if (inv.patientId === action.payload.patientId) {
          inv.patient = action.payload.name
        }
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchBootstrap.fulfilled, (_state, action) => action.payload.invoices)
  },
})

export const { addInvoice, updateInvoice, recordPayment, syncInvoicePatientName } = invoicesSlice.actions
export default invoicesSlice.reducer
