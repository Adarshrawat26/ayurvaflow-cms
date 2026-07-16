import { TrendingUp, ArrowRight, Users, CalendarDays, IndianRupee, Leaf, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { formatDisplayDate, toISODate } from '../lib/dates'
import { revenueByMonth, referralBreakdown, conditionBreakdown } from '../lib/revenue'
import type { Page, User } from '../App'
import { useAppSelector } from '../store/hooks'
import {
  selectActiveTreatments,
  selectBillingSummary,
  selectInvoices,
  selectOutstandingInvoices,
  selectPatients,
  selectTodayAppointments,
  selectAppointments,
} from '../store/selectors'
import { ConditionChart, ReferralChart, RevenueBarChart } from '../components/charts/DashboardCharts'
import ClinicalAlerts from '../features/dashboard/alerts/ClinicalAlerts'
import PrakritiChart from '../features/dashboard/charts/PrakritiChart'
import TodaySchedule from '../features/dashboard/components/TodaySchedule'

type DoctorLike = { id: string; name: string; specialization: string; patients: number }

const fmt     = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`

const STATUS_STYLE: Record<string, string> = {
  scheduled:   'bg-blue-50 text-blue-700 border border-blue-100',
  arrived:     'bg-amber-50 text-amber-700 border border-amber-100',
  in_progress: 'bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20',
  completed:   'bg-gray-100 text-gray-500 border border-gray-200',
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function Dashboard({ onNavigate, user, doctors: doctorsProp }: { onNavigate: (p: Page) => void; user?: User; doctors?: DoctorLike[] }) {
  const patients = useAppSelector(selectPatients)
  const invoices = useAppSelector(selectInvoices)
  const today = useAppSelector(selectTodayAppointments)
  const allAppts = useAppSelector(selectAppointments)
  const activeT = useAppSelector(selectActiveTreatments)
  const outstanding = useAppSelector(selectOutstandingInvoices)
  const billing = useAppSelector(selectBillingSummary)
  const [dismissed, setDismissed] = useState<string[]>([])

  const revenueData = revenueByMonth(invoices)
  const doctorsList: DoctorLike[] = doctorsProp ?? []
  const maxRev   = Math.max(...revenueData.map(r => r.revenue), 1)
  const prevRev  = revenueData[revenueData.length - 2]?.revenue ?? 0
  const currRev  = revenueData[revenueData.length - 1]?.revenue ?? 0
  const revGrowth = prevRev > 0 ? (((currRev - prevRev) / prevRev) * 100).toFixed(1) : '0.0'
  const referrals = referralBreakdown(patients)
  const conditions = conditionBreakdown(patients)
  const maxCond = conditions[0]?.count ?? 1

  // ── F5: Real trend computation — this month vs last month ─────────────────
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  const patientsThisMonth = patients.filter(p => p.createdAt?.startsWith(thisMonth)).length
  const patientsLastMonth = patients.filter(p => p.createdAt?.startsWith(lastMonth)).length
  const patientGrowth = patientsLastMonth > 0
    ? (((patientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100).toFixed(1)
    : patientsThisMonth > 0 ? '+∞' : '0.0'

  const apptThisMonth = allAppts.filter(a => a.date?.startsWith(thisMonth)).length
  const apptLastMonth = allAppts.filter(a => a.date?.startsWith(lastMonth)).length
  const apptGrowth = apptLastMonth > 0
    ? (((apptThisMonth - apptLastMonth) / apptLastMonth) * 100).toFixed(1)
    : apptThisMonth > 0 ? '+∞' : '0.0'

  const totalSessions = activeT.reduce((a, t) => a + t.completedSessions, 0)
  const endingSoon = activeT.filter(t => {
    const end = new Date(t.endDate)
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000)
    return daysLeft >= 0 && daysLeft <= 7
  }).length

  const kpis = [
    {
      label: 'Total Patients',
      value: patients.length,
      sub: patientsThisMonth > 0 ? `+${patientsThisMonth} this month` : 'No new registrations this month',
      trend: Number(patientGrowth) >= 0 ? 'up' : 'down',
      trendVal: `${Number(patientGrowth) >= 0 ? '↑' : '↓'} ${Math.abs(Number(patientGrowth)).toFixed(1)}%`,
      icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', page: 'patients' as Page,
    },
    {
      label: "Today's Appointments",
      value: today.length,
      sub: `${today.filter(a => a.status === 'in_progress').length} in progress · ${today.filter(a => a.status === 'completed').length} done`,
      trend: Number(apptGrowth) >= 0 ? 'up' : 'down',
      trendVal: `${Number(apptGrowth) >= 0 ? '↑' : '↓'} ${Math.abs(Number(apptGrowth)).toFixed(1)}% vs last month`,
      icon: CalendarDays, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', page: 'appointments' as Page,
    },
    {
      label: 'Monthly Revenue',
      value: fmt(currRev),
      sub: `${revGrowth}% vs last month`,
      trend: Number(revGrowth) >= 0 ? 'up' : 'down',
      trendVal: `${Number(revGrowth) >= 0 ? '↑' : '↓'} ${Math.abs(Number(revGrowth)).toFixed(1)}%`,
      icon: IndianRupee, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', page: 'billing' as Page,
    },
    {
      label: 'Active Treatments',
      value: activeT.length,
      sub: endingSoon > 0 ? `${endingSoon} programme${endingSoon > 1 ? 's' : ''} ending this week` : `${totalSessions} sessions done total`,
      trend: 'neutral' as const,
      trendVal: `${totalSessions} sessions done`,
      icon: Leaf, iconBg: 'bg-[#1B4332]/10', iconColor: 'text-[#1B4332]', page: 'treatments' as Page,
    },
  ]

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Good morning, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDisplayDate(toISODate())} · {user?.clinic ?? 'Kairali Ayurvedic Centre'}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 shrink-0">
          <AlertCircle size={13} />
          <span>{outstanding.length} invoices pending · {fmtFull(outstanding.reduce((a, i) => a + (i.total - i.paid), 0))} outstanding</span>
        </div>
      </motion.div>

      {/* Clinical Alerts — computed from Redux state */}
      <ClinicalAlerts
        onNavigate={onNavigate}
        onDismiss={id => setDismissed(d => [...d, id])}
        dismissed={dismissed}
      />

      {/* F9: Today's Schedule widget */}
      <TodaySchedule onNavigate={onNavigate} />

      {/* KPI cards — staggered */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xl:grid-cols-4 gap-3"
      >
        {kpis.map(k => {
          const Icon = k.icon
          return (
            <motion.button
              key={k.label}
              variants={fadeUp}
              onClick={() => onNavigate(k.page)}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="card p-4 text-left border border-gray-100 group"
            >
              <div className="flex items-start justify-between mb-3">
                <motion.div
                  className={`w-9 h-9 rounded-lg ${k.iconBg} flex items-center justify-center shrink-0`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Icon size={16} className={k.iconColor} />
                </motion.div>
                <span className={`text-[10px] font-medium ${k.trend === 'up' ? 'text-emerald-600' : k.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                  {k.trendVal}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{k.value}</div>
              <div className="text-xs font-medium text-gray-500 mt-1">{k.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{k.sub}</div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Revenue + Referrals */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0"
      >
        {/* Revenue chart */}
        <motion.div variants={fadeUp} className="card p-5 lg:col-span-2 xl:col-span-3 min-w-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly collections · last 6 months</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#1B4332]">{fmt(currRev)}</div>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <TrendingUp size={11} className="text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-medium">{revGrowth}% vs last month</span>
              </div>
            </div>
          </div>

          <RevenueBarChart data={revenueData} maxRevenue={maxRev} fmt={fmt} />

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            {[
              { label: 'Collected',   val: fmtFull(billing.totalRevenue) },
              { label: 'Outstanding', val: fmtFull(billing.totalOutstanding) },
              { label: 'Invoices',    val: `${billing.count} raised` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-sm font-semibold text-gray-900">{s.val}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referrals */}
        <motion.div variants={fadeUp} className="card p-5 min-w-0 overflow-hidden">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Referrals</h2>
          <p className="text-xs text-gray-400 mb-4">How patients find the centre</p>
          <ReferralChart items={referrals} />
        </motion.div>

        {/* Prakriti distribution */}
        <motion.div variants={fadeUp} className="card p-5 min-w-0 overflow-hidden">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Patient Constitution</h2>
          <p className="text-xs text-gray-400 mb-4">Prakriti breakdown · all patients</p>
          <PrakritiChart />
        </motion.div>
      </motion.div>

      {/* Schedule + Treatments + Conditions */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {/* Today's schedule */}
        <motion.div variants={fadeUp} className="card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">{today.length} appointments · {formatDisplayDate(toISODate())}</p>
            </div>
            <motion.button
              onClick={() => onNavigate('appointments')}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-[#1B4332] flex items-center gap-1 font-medium"
            >
              View <ArrowRight size={12} />
            </motion.button>
          </div>
          <div className="divide-y divide-gray-50">
            {today.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 shrink-0 text-center">
                  <div className="text-xs font-bold text-gray-900">{a.time}</div>
                  <div className="text-[10px] text-gray-400">{a.duration}m</div>
                </div>
                <div className="w-0.5 h-8 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{a.patient}</div>
                  <div className="text-[11px] text-gray-400 truncate mt-0.5">{a.type} · {a.doctor.replace('Dr. ', '')}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {a.status.replace('_', ' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active treatments */}
        <motion.div variants={fadeUp} className="card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Active Treatments</h2>
              <p className="text-xs text-gray-400 mt-0.5">{activeT.length} programmes ongoing</p>
            </div>
            <motion.button
              onClick={() => onNavigate('treatments')}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-[#1B4332] flex items-center gap-1 font-medium"
            >
              View <ArrowRight size={12} />
            </motion.button>
          </div>
          <div className="divide-y divide-gray-50">
            {activeT.map((t, i) => {
              const pct = Math.round((t.completedSessions / t.totalSessions) * 100)
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{t.patient}</div>
                      <div className="text-[11px] text-[#1B4332] font-medium mt-0.5">{t.type}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-xs font-bold text-gray-900">{pct}%</div>
                      <div className="text-[10px] text-gray-400">{t.completedSessions}/{t.totalSessions}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                      style={{ background: pct >= 75 ? '#52B788' : pct >= 40 ? '#1B4332' : '#A8D5B5' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Conditions + Doctors */}
        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
          <motion.div variants={fadeUp} className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Top Conditions</h2>
            <p className="text-xs text-gray-400 mb-4">Patients by primary complaint</p>
            <ConditionChart items={conditions} maxCount={maxCond} />
          </motion.div>

          <motion.div variants={fadeUp} className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Doctors</h2>
            <p className="text-xs text-gray-400 mb-4">Patient load this month</p>
            <div className="space-y-3">
              {doctorsList.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[10px] font-bold text-[#1B4332] shrink-0">
                    {d.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{d.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{d.specialization}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-gray-900">{d.patients}</div>
                    <div className="text-[10px] text-gray-400">patients</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  )
}
