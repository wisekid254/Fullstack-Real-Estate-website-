import axios from "axios";
import store from "../store/index";
import { logout } from "../store/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem("token");

    if (error.response?.status === 401 && hadToken) {
      store.dispatch(logout());
      window.location.href = "/login";
    }

    if (error.response?.status === 429) {
      console.warn("Rate limit hit, slow down requests");
    }

    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.data?.message);
    }

    return Promise.reject(error);
  },
);

export default api;
