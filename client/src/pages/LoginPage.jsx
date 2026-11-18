import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { loginUser } from "../store/authSlice";
import useAuth from "../hooks/useAuth";
import GoogleButton from "../components/auth/GoogleButton";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loading,
    error,
    clearError,
    requiresOTP,
    requiresVerification,
  } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (requiresOTP) navigate("/verify-otp");
  }, [requiresOTP, navigate]);
  useEffect(() => {
    if (requiresVerification) navigate("/verify-email");
  }, [requiresVerification, navigate]);
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-display-md text-surface-900 mb-2">
            Welcome back
          </h1>
          <p className="text-surface-600 text-sm">
            Sign in to your nestHaven account
          </p>
        </div>

        <div className="card p-8">
          <GoogleButton text="signin_with" />

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-surface-900">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500 hover:text-surface-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Continue"}
            </button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-4">
            Email sign-in is protected with a one-time code
          </p>

          <p className="text-center text-sm text-surface-600 mt-5">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-500 font-medium hover:text-brand-600"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
