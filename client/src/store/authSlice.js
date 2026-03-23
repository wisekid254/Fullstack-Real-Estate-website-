import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

// Load user from localStorage on app start
const user  = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')

// ── Async thunks ──────────────────────────────────────────
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.register(formData)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.login(formData)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe()
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    user  || null,
    token:   token || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true
      state.error   = null
    }
    const handleFulfilled = (state, action) => {
      state.loading = false
      state.user    = action.payload.user
      state.token   = action.payload.token
      localStorage.setItem('user',  JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    }
    const handleRejected = (state, action) => {
      state.loading = false
      state.error   = action.payload
    }

    builder
      .addCase(registerUser.pending,   handlePending)
      .addCase(registerUser.fulfilled, handleFulfilled)
      .addCase(registerUser.rejected,  handleRejected)
      .addCase(loginUser.pending,      handlePending)
      .addCase(loginUser.fulfilled,    handleFulfilled)
      .addCase(loginUser.rejected,     handleRejected)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer