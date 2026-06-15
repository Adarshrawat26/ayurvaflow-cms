import { prisma } from './prisma.js'
import { num } from './mappers.js'

export async function syncPatientBalance(patientId: string) {
  const allInvoices = await prisma.invoice.findMany({ where: { patientId } })
  const balance = allInvoices.reduce((a, i) => a + (num(i.total) - num(i.paid)), 0)
  await prisma.patient.update({ where: { id: patientId }, data: { balance } })
  return balance
}
