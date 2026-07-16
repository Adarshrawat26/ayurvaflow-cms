import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gauge, UserRound, CalendarClock, HeartPulse, ClipboardPlus,
  Receipt, SlidersHorizontal, LogOut, BarChart2,
} from 'lucide-react'
import type { User, Page } from '../App'
import { useAppSelector } from '../store/hooks'
import { selectDoctorsWithLoad } from '../store/selectors'
import { pagesForRole, defaultPageForRole } from '../lib/nav'
import Logo from '../components/Logo'
import Dashboard from './Dashboard'
import Patients from './Patients'
import Appointments from './Appointments'
import Treatments from './Treatments'
import Consultations from './Consultations'
import Billing from './Billing'
import SettingsPage from './Settings'
import Reports from '../features/reports/Reports'

const NAV_ICONS: Record<Page, React.ElementType> = {
  dashboard: Gauge,
  patients: UserRound,
  appointments: CalendarClock,
  treatments: HeartPulse,
  consultations: ClipboardPlus,
  billing: Receipt,
  reports: BarChart2,
  settings: SlidersHorizontal,
}

const NAV_LABELS: Record<Page, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  appointments: 'Appointments',
  treatments: 'Treatments',
  consultations: 'Consultations',
  billing: 'Billing',
  reports: 'Reports',
  settings: 'Settings',
}

const NAV_SHORT: Record<Page, string> = {
  dashboard: 'Home',
  patients: 'Patients',
  appointments: 'Calendar',
  treatments: 'Treatments',
  consultations: 'Notes',
  billing: 'Billing',
  reports: 'Reports',
  settings: 'Settings',
}

interface Props {
  user: User
  onLogout: () => void
}

export default function Layout({ user, onLogout }: Props) {
  const allowedPages = pagesForRole(user.role)
  const nav = allowedPages.map(id => ({ id, label: NAV_LABELS[id], shortLabel: NAV_SHORT[id], Icon: NAV_ICONS[id] }))

  const [page, setPage] = useState<Page>(defaultPageForRole(user.role))
  const activeDoctors = useAppSelector(selectDoctorsWithLoad)

  const navigate = (p: Page) => {
    if (!allowedPages.includes(p)) return
    setPage(p)
  }

  const sharedProps = { onNavigate: navigate, user }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard {...sharedProps} doctors={activeDoctors} />
      case 'patients':      return <Patients {...sharedProps} />
      case 'appointments':  return <Appointments {...sharedProps} doctors={activeDoctors} />
      case 'treatments':    return <Treatments {...sharedProps} />
      case 'consultations': return <Consultations {...sharedProps} />
      case 'billing':       return <Billing {...sharedProps} />
      case 'reports':       return <Reports />
      case 'settings':      return <SettingsPage {...sharedProps} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <div className="h-14 flex items-center px-4 border-b border-gray-200 gap-2.5">
          <Logo className="w-8 h-8 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">Kairali CMS</div>
            <div className="text-[10px] text-gray-400 leading-tight truncate max-w-[110px]">{user.clinic}</div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ id, label, Icon }) => {
            const active = page === id
            return (
              <motion.button
                key={id}
                onClick={() => navigate(id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'text-[#1B4332] font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-[#1B4332]/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </motion.button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] text-xs font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-[10px] text-gray-400 capitalize">{user.role}</div>
            </div>
          </div>
          <motion.button
            onClick={onLogout}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Sign out
          </motion.button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen min-w-0 w-full">
        {/* Topbar — title only on mobile (nav is in bottom bar) */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-20">
          <AnimatePresence mode="wait">
            <motion.h2
              key={page}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-sm font-semibold text-gray-900 flex-1 min-w-0 truncate"
            >
              {nav.find(n => n.id === page)?.label}
            </motion.h2>
          </AnimatePresence>
          <div className="text-xs text-gray-400 hidden md:block truncate max-w-[140px]">{user.clinic}</div>
          <button
            type="button"
            onClick={onLogout}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page content — animated on route change */}
        <main className="flex-1 pb-[4.5rem] lg:pb-0 w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav — only navigation on phones/tablets */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 overflow-x-auto"
        aria-label="Main navigation"
      >
        <div className="flex min-w-max px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {nav.map(({ id, shortLabel, Icon }) => {
            const active = page === id
            return (
              <motion.button
                key={id}
                onClick={() => navigate(id)}
                whileTap={{ scale: 0.92 }}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-w-[4.25rem] px-2 py-2.5 gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-[#1B4332]' : 'text-gray-400'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                <span className="truncate max-w-[4rem]">{shortLabel}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
