import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE, type RehydrateAction } from 'redux-persist'
import type { User } from '@/types/entities'
import { fetchBootstrap } from '../thunks/bootstrap'
import { loginPatientPortal, loginUser } from '../thunks/apiThunks'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  bootstrapping: boolean
  dataLoaded: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  bootstrapping: false,
  dataLoaded: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      state.dataLoaded = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user as User
        state.dataLoaded = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? action.error.message ?? 'Login failed'
      })
      .addCase(loginPatientPortal.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginPatientPortal.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user as User
        state.dataLoaded = true
      })
      .addCase(loginPatientPortal.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? action.error.message ?? 'Login failed'
      })
      .addCase(fetchBootstrap.pending, state => {
        state.bootstrapping = true
        state.error = null
      })
      .addCase(fetchBootstrap.fulfilled, state => {
        state.bootstrapping = false
        state.dataLoaded = true
        state.error = null
      })
      .addCase(fetchBootstrap.rejected, (state, action) => {
        state.bootstrapping = false
        state.dataLoaded = false
        state.error = action.error.message ?? 'Failed to load data'
      })
      .addCase(REHYDRATE, (state, action: RehydrateAction) => {
        const payload = action.payload as { auth?: AuthState } | undefined
        if (payload?.auth?.token) {
          state.dataLoaded = payload.auth.user?.role === 'patient'
        }
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
