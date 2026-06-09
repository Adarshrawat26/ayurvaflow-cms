import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import './index.css'
import App from './App.tsx'
import AppToaster from './components/AppToaster.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { persistor, store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>} persistor={persistor}>
          <App />
          <AppToaster />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
