import api from "./api";

const authService = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },
  verifyOtp: async (data) => {
    const res = await api.post("/auth/verify-otp", data);
    return res.data;
  },
  verifySignupOtp: async (data) => {
    const res = await api.post("/auth/verify-signup-otp", data);
    return res.data;
  },
  resendOtp: async (email, purpose = "login") => {
    const res = await api.post("/auth/resend-otp", { email, purpose });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export default authService;
