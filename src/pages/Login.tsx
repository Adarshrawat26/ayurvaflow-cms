import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Role } from '../App'
import Logo from '../components/Logo'
import PortalRegistrationOnboarding from '../components/portal/PortalRegistrationOnboarding'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginPatientPortal, loginUser, signupPatientPortal } from '../store/thunks/apiThunks'
import { clearError } from '../store/slices/authSlice'

const STAFF_DEMO = [
  { role: 'admin' as Role, label: 'Admin', email: 'admin@kairali.com' },
  { role: 'receptionist' as Role, label: 'Reception', email: 'reception@kairali.com' },
  { role: 'doctor' as Role, label: 'Doctor', email: 'doctor@kairali.com' },
  { role: 'therapist' as Role, label: 'Therapist', email: 'therapist@kairali.com' },
]

const DEMO_PASSWORD = '1234'

type LoginMode = 'staff' | 'patient'
type PatientView = 'signin' | 'registration' | 'signup'

export default function Login() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector(state => state.auth)
  const [mode, setMode] = useState<LoginMode>('staff')
  const [patientView, setPatientView] = useState<PatientView>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'patient') {
      dispatch(loginPatientPortal({ email, password }))
    } else {
      dispatch(loginUser({ email, password }))
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (signupPassword !== signupConfirm) {
      dispatch(clearError())
      return
    }
    dispatch(signupPatientPortal({
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
    }))
  }

  const switchMode = (next: LoginMode) => {
    setMode(next)
    setPatientView('signin')
    dispatch(clearError())
  }

  const openPatientView = (view: PatientView) => {
    setPatientView(view)
    dispatch(clearError())
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    setPatientView('signin')
    dispatch(clearError())
  }

  const showRegistrationGuide = mode === 'patient' && patientView === 'registration'
  const showSignup = mode === 'patient' && patientView === 'signup'
  const wideLayout = showRegistrationGuide

  const passwordMismatch = showSignup && signupConfirm.length > 0 && signupPassword !== signupConfirm

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
          className={`w-full ${wideLayout ? 'max-w-4xl xl:max-w-5xl' : 'max-w-sm'}`}
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
                onCreateAccount={() => openPatientView('signup')}
                onSignIn={() => openPatientView('signin')}
              />
            ) : showSignup ? (
              <form onSubmit={handleSignup}>
                <button
                  type="button"
                  onClick={() => openPatientView('registration')}
                  className="text-xs font-medium text-[#1B4332] hover:underline mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Create account</h2>
                <p className="text-gray-500 text-xs mb-5">
                  Sign up to complete one-time registration and book visits online.
                </p>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input-field"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Priya Sharma"
                    />
                  </div>
                  <div>
                    <label className="label">Mobile</label>
                    <input
                      className="input-field"
                      type="tel"
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      autoComplete="tel"
                      placeholder="9876543210"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      className="input-field"
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      required
                      minLength={4}
                      autoComplete="new-password"
                      placeholder="At least 4 characters"
                    />
                  </div>
                  <div>
                    <label className="label">Confirm password</label>
                    <input
                      className="input-field"
                      type="password"
                      value={signupConfirm}
                      onChange={e => setSignupConfirm(e.target.value)}
                      required
                      minLength={4}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                    />
                    {passwordMismatch && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || passwordMismatch}
                >
                  {loading ? 'Creating account…' : 'Create account & continue'}
                </button>

                <button
                  type="button"
                  onClick={() => openPatientView('signin')}
                  className="w-full mt-3 py-2 text-xs font-medium text-[#1B4332] hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Sign in</h2>
                <p className="text-gray-500 text-xs mb-5">
                  {mode === 'staff'
                    ? 'Demo staff accounts use @kairali.com — password 1234'
                    : 'Returning patients sign in · new patients create an account below'}
                </p>

                <div className="rounded-lg border border-dashed border-[#1B4332]/25 bg-[#1B4332]/[0.04] p-3 mb-5 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1B4332]">
                    Demo logins · password {DEMO_PASSWORD}
                  </p>
                  {mode === 'staff' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {STAFF_DEMO.map(account => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => fillDemo(account.email)}
                          className="py-2 px-2.5 rounded-lg text-[11px] font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors text-left"
                        >
                          {account.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemo('priya@email.com')}
                        className="py-2 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors text-left"
                      >
                        Priya — registered member
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo('anita@email.com')}
                        className="py-2 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors text-left"
                      >
                        Anita — complete registration online
                      </button>
                    </div>
                  )}
                </div>

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
                      placeholder={mode === 'staff' ? 'admin@kairali.com' : 'priya@email.com'}
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
                      placeholder="1234"
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
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => openPatientView('signup')}
                      className="w-full py-2.5 rounded-lg text-sm font-medium border-2 border-[#1B4332]/20 text-[#1B4332] bg-[#1B4332]/5 hover:bg-[#1B4332]/10 transition-colors"
                    >
                      Create account
                    </button>
                    <button
                      type="button"
                      onClick={() => openPatientView('registration')}
                      className="w-full py-2 text-xs font-medium text-gray-500 hover:text-[#1B4332]"
                    >
                      How does one-time registration work?
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
