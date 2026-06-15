export const FOLLOW_UP_FEE = {
  label: 'Follow-up visit (45 min)',
  subtotal: 1271,
  taxRate: 0.18,
  get tax() {
    return Math.round(this.subtotal * this.taxRate)
  },
  get total() {
    return this.subtotal + this.tax
  },
}

export const PORTAL_PAYMENT_METHODS = ['upi', 'card', 'netbanking'] as const
export type PortalPaymentMethod = (typeof PORTAL_PAYMENT_METHODS)[number]

export function bookingFeeQuote() {
  return {
    label: FOLLOW_UP_FEE.label,
    subtotal: FOLLOW_UP_FEE.subtotal,
    tax: FOLLOW_UP_FEE.tax,
    total: FOLLOW_UP_FEE.total,
    currency: 'INR',
  }
}
