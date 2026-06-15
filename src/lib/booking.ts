export const FOLLOW_UP_FEE = {
  label: 'Follow-up visit (45 min)',
  subtotal: 1271,
  tax: 229,
  total: 1500,
}

export type PortalPaymentMethod = 'upi' | 'card' | 'netbanking'

export const PAYMENT_OPTIONS: { id: PortalPaymentMethod; label: string; hint: string }[] = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', hint: 'Debit or credit' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major banks' },
]

export interface BookingConfirmation {
  confirmationId: string
  appointment: {
    id: string
    date: string
    time: string
    type: string
    doctor: string
    duration: number
    status: string
  }
  payment: {
    method: PortalPaymentMethod
    amount: number
    txnId: string
    paidAt: string
  }
  invoiceId: string
}
