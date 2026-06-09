export type AccountType = 'staff' | 'patient'

export interface AuthPayload {
  userId: string
  tenantId: string
  role: string
  email: string
  accountType: AccountType
  patientId?: string
}
