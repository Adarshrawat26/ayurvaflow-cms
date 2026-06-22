import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { api, ApiError } from '@/lib/api'
import { logout } from '../slices/authSlice'

export const fetchBootstrap = createAsyncThunk(
  'data/bootstrap',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token
    if (!token) return rejectWithValue('Not authenticated')
    try {
      return await api.bootstrap(token)
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        dispatch(logout())
      }
      return rejectWithValue(e instanceof ApiError ? e.message : 'Failed to load data')
    }
  },
)
