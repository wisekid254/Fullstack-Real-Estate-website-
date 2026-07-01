import zxcvbn from "zxcvbn";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { registerUser } from "../store/authSlice";
import useAuth from "../hooks/useAuth";
import { useSelector } from "react-redux";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading, error, clearError } = useAuth();
  const requiresVerification = useSelector((s) => s.auth.requiresVerification);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: searchParams.get("role") === "agent" ? "agent" : "user",
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
    if (requiresVerification) navigate("/verify-email");
  }, [requiresVerification, navigate]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    );
  };

  const isAgent = form.role === "agent";

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
            {isAgent ? "Join as an agent" : "Create your account"}
          </h1>
          <p className="text-surface-600 text-sm">
            {isAgent
              ? "List your properties and reach thousands of buyers"
              : "Join thousands finding their perfect home"}
          </p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "user" }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                form.role === "user"
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-surface-200 text-surface-600 hover:border-brand-300"
              }`}
            >
              I am a buyer / renter
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "agent" }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                form.role === "agent"
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-surface-200 text-surface-600 hover:border-brand-300"
              }`}
            >
              I am an agent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
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
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            {isAgent && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-sm text-brand-700">
                As an agent you can post listings and manage inquiries from
                buyers.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? "Creating account…"
                : isAgent
                  ? "Join as agent"
                  : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-surface-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-500 font-medium hover:text-brand-600"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
function PasswordStrength({ password }) {
  if (!password) return null;
  const result = zxcvbn(password);
  const score = result.score; // 0-4

  const levels = [
    { label: "Very weak", color: "bg-red-500", width: "w-1/4" },
    { label: "Weak", color: "bg-orange-500", width: "w-2/4" },
    { label: "Fair", color: "bg-yellow-500", width: "w-3/4" },
    { label: "Strong", color: "bg-green-500", width: "w-full" },
    { label: "Very strong", color: "bg-green-600", width: "w-full" },
  ];

  const current = levels[score];

  const checks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-surface-500">Password strength</span>
        <span
          className={`text-xs font-medium ${
            score < 2
              ? "text-red-500"
              : score < 3
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          {current.label}
        </span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${current.color} ${current.width}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                c.pass ? "bg-green-100" : "bg-surface-100"
              }`}
            >
              {c.pass ? (
                <svg
                  className="w-2.5 h-2.5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <div className="w-1 h-1 rounded-full bg-surface-300" />
              )}
            </div>
            <span
              className={`text-xs ${c.pass ? "text-surface-600" : "text-surface-400"}`}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
