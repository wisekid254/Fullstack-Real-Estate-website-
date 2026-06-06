import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.register(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.login(formData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.verifyOtp(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid code");
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    token: token || null,
    loading: false,
    error: null,
    requiresOTP: false,
    pendingEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.requiresOTP = false;
      state.pendingEmail = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
    clearOTPState(state) {
      state.requiresOTP = false;
      state.pendingEmail = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)

      // Login — step 1: just sets requiresOTP
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresOTP = true;
        state.pendingEmail = action.payload.email;
      })
      .addCase(loginUser.rejected, rejected)

      // OTP verify — step 2: sets user + token
      .addCase(verifyOtpThunk.pending, pending)
      .addCase(verifyOtpThunk.fulfilled, fulfilled)
      .addCase(verifyOtpThunk.rejected, rejected)

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, clearError, clearOTPState } = authSlice.actions;
export default authSlice.reducer;
