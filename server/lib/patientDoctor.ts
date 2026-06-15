import { prisma } from './prisma.js'

/** Doctor this patient usually sees — from upcoming visit, recent visit, or active care plan. */
export async function getPatientCareDoctor(patientId: string): Promise<string | null> {
  const upcoming = await prisma.appointment.findFirst({
    where: {
      patientId,
      status: { in: ['SCHEDULED', 'ARRIVED', 'IN_PROGRESS'] },
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })
  if (upcoming) return upcoming.doctorName

  const recent = await prisma.appointment.findFirst({
    where: {
      patientId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
    orderBy: [{ date: 'desc' }, { time: 'desc' }],
  })
  if (recent) return recent.doctorName

  const plan = await prisma.treatmentPlan.findFirst({
    where: { patientId, status: 'ACTIVE' },
    orderBy: { startDate: 'desc' },
  })
  return plan?.doctorName ?? null
}
