import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistedState,
} from 'redux-persist'
import storage from './storage'

import authReducer from './slices/authSlice'
import staffReducer from './slices/staffSlice'
import patientsReducer from './slices/patientsSlice'
import appointmentsReducer from './slices/appointmentsSlice'
import treatmentsReducer from './slices/treatmentsSlice'
import invoicesReducer from './slices/invoicesSlice'
import consultationsReducer from './slices/consultationsSlice'
import settingsReducer from './slices/settingsSlice'
import registrationsReducer from './slices/registrationsSlice'
import { auditMiddleware } from './middleware/auditMiddleware'

function isValidPersistedState(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false
  const s = state as Record<string, unknown>
  const auth = s.auth as Record<string, unknown> | undefined
  return !auth || typeof auth === 'object'
}

const migrations = {
  2: (state: PersistedState): PersistedState => {
    if (!isValidPersistedState(state)) return undefined as PersistedState
    return state
  },
  3: (state: PersistedState): PersistedState => {
    if (!isValidPersistedState(state)) return undefined as PersistedState
    return {
      ...state,
      auth: {
        user: null,
        token: null,
        loading: false,
        bootstrapping: false,
        dataLoaded: false,
        error: null,
      },
    } as PersistedState
  },
}

const persistConfig = {
  key: 'ayurvaflow-cms',
  version: 3,
  storage,
  whitelist: ['auth'],
  migrate: createMigrate(migrations, { debug: false }),
}

const rootReducer = combineReducers({
  auth: authReducer,
  staff: staffReducer,
  patients: patientsReducer,
  appointments: appointmentsReducer,
  treatments: treatmentsReducer,
  invoices: invoicesReducer,
  consultations: consultationsReducer,
  settings: settingsReducer,
  registrations: registrationsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(auditMiddleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
