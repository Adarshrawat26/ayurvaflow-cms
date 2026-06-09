import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { api } from '@/lib/api'

export const fetchBootstrap = createAsyncThunk(
  'data/bootstrap',
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (!token) throw new Error('Not authenticated')
    return api.bootstrap(token)
  }
)
