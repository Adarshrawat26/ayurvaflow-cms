import { useEffect } from 'react'
import Login from './pages/Login'
import Layout from './pages/Layout'
import PatientPortal from './pages/PatientPortal'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { logout } from './store/slices/authSlice'
import { fetchBootstrap } from './store/thunks/bootstrap'

export type { Page, Role, User } from './types/entities'

function BootstrapError({ message, onRetry, onLogout }: { message: string; onRetry: () => void; onLogout: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="card p-6 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Could not load clinic data</h2>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onRetry} className="btn-primary w-full">Try again</button>
          <button onClick={onLogout} className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch()
  const { user, token, bootstrapping, error, dataLoaded } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (token && user && user.role !== 'patient' && !dataLoaded && !bootstrapping) {
      dispatch(fetchBootstrap())
    }
  }, [token, user, dataLoaded, bootstrapping, dispatch])

  if (!token || !user) return <Login />

  if (user.role === 'patient') {
    return <PatientPortal user={user} token={token} onLogout={() => dispatch(logout())} />
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Loading clinic data…</p>
      </div>
    )
  }

  if (error && !dataLoaded) {
    return (
      <BootstrapError
        message={error}
        onRetry={() => dispatch(fetchBootstrap())}
        onLogout={() => dispatch(logout())}
      />
    )
  }

  return <Layout user={user} onLogout={() => dispatch(logout())} />
}
