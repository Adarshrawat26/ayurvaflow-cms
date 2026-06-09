import { useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
  Gauge, UserRound, CalendarClock, HeartPulse, ClipboardPlus,
  Receipt, SlidersHorizontal, Menu, X, LogOut, ChevronRight
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

const NAV_ICONS: Record<Page, React.ElementType> = {
  dashboard: Gauge,
  patients: UserRound,
  appointments: CalendarClock,
  treatments: HeartPulse,
  consultations: ClipboardPlus,
  billing: Receipt,
  reports: Gauge,
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

interface Props {
  user: User
  onLogout: () => void
}

export default function Layout({ user, onLogout }: Props) {
  const allowedPages = pagesForRole(user.role)
  const nav = allowedPages.map(id => ({ id, label: NAV_LABELS[id], Icon: NAV_ICONS[id] }))
  const bottomNav = nav.slice(0, Math.min(4, nav.length))

  const [page, setPage] = useState<Page>(defaultPageForRole(user.role))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerDrag = useDragControls()
  const activeDoctors = useAppSelector(selectDoctorsWithLoad)

  const navigate = (p: Page) => {
    if (!allowedPages.includes(p)) return
    setPage(p)
    setDrawerOpen(false)
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
      case 'settings': return <SettingsPage {...sharedProps} />
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

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40"
            onClick={() => setDrawerOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl"
              onClick={e => e.stopPropagation()}
              drag="x"
              dragControls={drawerDrag}
              dragListener={false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.45, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -72 || info.velocity.x < -400) setDrawerOpen(false)
              }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              <div
                className="h-14 flex items-center justify-between px-4 border-b border-gray-200 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={e => drawerDrag.start(e)}
              >
                <div className="flex items-center gap-2.5">
                  <Logo className="w-7 h-7 shrink-0" />
                  <div className="text-sm font-semibold text-gray-900">Kairali CMS</div>
                </div>
                <motion.button
                  onClick={() => setDrawerOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 text-gray-500"
                >
                  <X size={18} />
                </motion.button>
              </div>
              <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {nav.map(({ id, label, Icon }, i) => {
                  const active = page === id
                  return (
                    <motion.button
                      key={id}
                      onClick={() => navigate(id)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active ? 'bg-[#1B4332]/10 text-[#1B4332] font-medium' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                      {active && <ChevronRight size={14} className="ml-auto" />}
                    </motion.button>
                  )
                })}
              </nav>
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] text-xs font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
                <motion.button
                  onClick={onLogout}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Sign out
                </motion.button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen min-w-0 w-full">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-20">
          <motion.button
            className="lg:hidden p-1.5 text-gray-500"
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={20} />
          </motion.button>
          <AnimatePresence mode="wait">
            <motion.h2
              key={page}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-sm font-semibold text-gray-900 flex-1"
            >
              {nav.find(n => n.id === page)?.label}
            </motion.h2>
          </AnimatePresence>
          <div className="text-xs text-gray-400 hidden sm:block">{user.clinic}</div>
        </header>

        {/* Page content — animated on route change */}
        <main className="flex-1 pb-20 lg:pb-0 w-full overflow-x-hidden">
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

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
        {bottomNav.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <motion.button
              key={id}
              onClick={() => navigate(id)}
              whileTap={{ scale: 0.88 }}
              className={`flex-1 flex flex-col items-center py-2 gap-1 text-[10px] transition-colors ${
                active ? 'text-[#1B4332]' : 'text-gray-400'
              }`}
            >
              <motion.div animate={{ scale: active ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <Icon size={20} />
              </motion.div>
              {label}
            </motion.button>
          )
        })}
        <motion.button
          onClick={() => setDrawerOpen(true)}
          whileTap={{ scale: 0.88 }}
          className="flex-1 flex flex-col items-center py-2 gap-1 text-[10px] text-gray-400"
        >
          <Menu size={20} />
          More
        </motion.button>
      </nav>
    </div>
  )
}
