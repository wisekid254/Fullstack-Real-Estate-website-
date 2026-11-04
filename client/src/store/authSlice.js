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
      const data = err.response?.data;
      if (data?.requiresVerification) {
        return rejectWithValue({
          requiresVerification: true,
          email: data.email,
          message: data.message,
        });
      }
      return rejectWithValue({ message: data?.message || "Login failed" });
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

export const verifySignupOtpThunk = createAsyncThunk(
  "auth/verifySignupOtp",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.verifySignupOtp(data);
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
    requiresVerification: false,
    pendingEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.requiresOTP = false;
      state.requiresVerification = false;
      state.pendingEmail = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
    clearOTPState(state) {
      state.requiresOTP = false;
      state.requiresVerification = false;
      state.pendingEmail = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    };

    builder
      // Register — sends signup OTP, no token yet
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresVerification = true;
        state.pendingEmail = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login — step 1
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresOTP = true;
        state.pendingEmail = action.payload.email;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.requiresVerification) {
          state.requiresVerification = true;
          state.pendingEmail = action.payload.email;
          state.error = action.payload.message;
        } else {
          state.error = action.payload?.message || action.payload;
        }
      })

      // Login OTP verify — step 2
      .addCase(verifyOtpThunk.pending, pending)
      .addCase(verifyOtpThunk.fulfilled, fulfilled)
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Signup OTP verify — activates account + logs in
      .addCase(verifySignupOtpThunk.pending, pending)
      .addCase(verifySignupOtpThunk.fulfilled, fulfilled)
      .addCase(verifySignupOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, clearError, clearOTPState } = authSlice.actions;
export default authSlice.reducer;
