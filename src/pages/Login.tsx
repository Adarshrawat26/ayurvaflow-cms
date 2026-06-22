import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Role } from '../App'
import Logo from '../components/Logo'
import PortalRegistrationOnboarding from '../components/portal/PortalRegistrationOnboarding'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginPatientPortal, loginUser } from '../store/thunks/apiThunks'
import { clearError } from '../store/slices/authSlice'
import { DEFAULT_CLINIC_SETTINGS } from '@/types/clinic'

const IS_DEV = import.meta.env.DEV

const DEV_ACCOUNTS: { role: Role; label: string; email: string }[] = [
  { role: 'admin', label: 'Admin', email: 'admin@kairali.com' },
  { role: 'receptionist', label: 'Receptionist', email: 'reception@kairali.com' },
  { role: 'doctor', label: 'Doctor', email: 'doctor@kairali.com' },
  { role: 'therapist', label: 'Therapist', email: 'therapist@kairali.com' },
]

type LoginMode = 'staff' | 'patient'
type PatientView = 'signin' | 'registration'

export default function Login() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector(state => state.auth)
  const [mode, setMode] = useState<LoginMode>('staff')
  const [patientView, setPatientView] = useState<PatientView>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'patient') {
      dispatch(loginPatientPortal({ email, password }))
    } else {
      dispatch(loginUser({ email, password }))
    }
  }

  const switchMode = (next: LoginMode) => {
    setMode(next)
    setPatientView('signin')
    dispatch(clearError())
  }

  const showRegistrationGuide = mode === 'patient' && patientView === 'registration'

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[420px] bg-[#1B4332] p-10"
      >
        <div />
        <div className="flex flex-col items-center text-center">
          <Logo className="w-32 h-auto mb-4 opacity-95" />
          <p className="text-[#A8D5B5] text-sm mt-2">
            Multi-tenant clinic management for Ayurveda centres
          </p>
        </div>
        <p className="text-[#52B788] text-xs text-center">© {new Date().getFullYear()} Kairali CMS</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
          className={`w-full ${showRegistrationGuide ? 'max-w-4xl xl:max-w-5xl' : 'max-w-sm'}`}
        >
          <div className="lg:hidden mb-8 text-center">
            <Logo className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-gray-900">Kairali CMS</h1>
            <p className="text-gray-500 text-sm">Ayurveda Centre Management</p>
          </div>

          <div className="card p-6 shadow-sm">
            <div className="flex rounded-lg border border-gray-200 p-0.5 mb-5">
              {(['staff', 'patient'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                    mode === m ? 'bg-[#1B4332] text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'staff' ? 'Staff' : 'Patient Portal'}
                </button>
              ))}
            </div>

            {showRegistrationGuide ? (
              <PortalRegistrationOnboarding
                clinic={DEFAULT_CLINIC_SETTINGS.name}
                contact={{
                  phone: DEFAULT_CLINIC_SETTINGS.phone,
                  email: DEFAULT_CLINIC_SETTINGS.email,
                  address: DEFAULT_CLINIC_SETTINGS.address,
                }}
                onBackToSignIn={() => setPatientView('signin')}
              />
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Sign in</h2>
                <p className="text-gray-500 text-xs mb-5">
                  {mode === 'staff'
                    ? 'Enter your staff credentials to continue'
                    : 'Registered members sign in to book follow-ups and view records'}
                </p>

                {IS_DEV && mode === 'staff' && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {DEV_ACCOUNTS.map(account => (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => {
                          setEmail(account.email)
                          setPassword('1234')
                          dispatch(clearError())
                        }}
                        className="py-2 px-3 rounded-lg text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors"
                      >
                        {account.label}
                      </button>
                    ))}
                  </div>
                )}

                {IS_DEV && mode === 'patient' && (
                  <div className="grid grid-cols-1 gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('priya@email.com')
                        setPassword('1234')
                        dispatch(clearError())
                      }}
                      className="py-2 px-3 rounded-lg text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors text-left"
                    >
                      Registered member — Priya (your calendar only)
                    </button>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder={mode === 'staff' ? 'you@clinic.com' : 'you@email.com'}
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      className="input-field"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>

                {mode === 'patient' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 text-center mb-3">
                      First time at the centre?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientView('registration')
                        dispatch(clearError())
                      }}
                      className="w-full py-2.5 rounded-lg text-sm font-medium border-2 border-[#1B4332]/20 text-[#1B4332] bg-[#1B4332]/5 hover:bg-[#1B4332]/10 transition-colors"
                    >
                      One-Time Registration
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
