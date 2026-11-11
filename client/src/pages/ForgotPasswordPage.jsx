import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import authService from "../services/authService";
import SEO from "../components/common/SEO";

const getRules = (password) => [
  { label: "At least 8 characters", pass: password.length >= 8 },
  { label: "An uppercase letter", pass: /[A-Z]/.test(password) },
  { label: "A lowercase letter", pass: /[a-z]/.test(password) },
  { label: "A number", pass: /\d/.test(password) },
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const rules = getRules(password);
  const allRulesMet = rules.every((r) => r.pass);

  const requestCode = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success("If that email is registered, a code has been sent");
      setStep("reset");
      setCountdown(60);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    if (!allRulesMet) {
      toast.error("Your new password does not meet all the requirements");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp,
        password,
      });
      setStep("done");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center px-4 py-12">
      <SEO
        title="Reset password — nestHaven"
        description="Reset your nestHaven account password."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {step === "email" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>
              <h1 className="text-display-md text-surface-900 mb-2">
                Forgot your password?
              </h1>
              <p className="text-surface-600 text-sm">
                Enter the email you registered with and we will send you a code
                to reset it.
              </p>
            </div>

            <div className="card p-8">
              <form onSubmit={requestCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? "Sending code..." : "Send reset code"}
                </button>
              </form>

              <p className="text-center text-sm text-surface-600 mt-6">
                Remembered it?{" "}
                <Link
                  to="/login"
                  className="text-brand-500 font-medium hover:text-brand-600"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h1 className="text-display-md text-surface-900 mb-2">
                Check your email
              </h1>
              <p className="text-surface-600 text-sm">
                If an account exists for
              </p>
              <p className="text-surface-900 font-medium text-sm mt-1">
                {email}
              </p>
              <p className="text-surface-600 text-sm mt-1">
                we sent a 6-digit code.
              </p>
            </div>

            <div className="card p-8">
              <form onSubmit={submitReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1.5">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    required
                    autoFocus
                    className="input text-center text-xl tracking-widest font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      required
                      className="input pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500 hover:text-surface-700"
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                      {rules.map((rule) => (
                        <div
                          key={rule.label}
                          className="flex items-center gap-1.5"
                        >
                          <div
                            className={
                              "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 " +
                              (rule.pass ? "bg-green-100" : "bg-surface-100")
                            }
                          >
                            {rule.pass ? (
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
                            className={
                              "text-xs " +
                              (rule.pass
                                ? "text-surface-600"
                                : "text-surface-400")
                            }
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat the new password"
                    required
                    className="input"
                  />
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6 ||
                    !allRulesMet ||
                    password !== confirm
                  }
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <div className="text-center mt-5">
                {countdown > 0 ? (
                  <p className="text-sm text-surface-500">
                    Resend code in{" "}
                    <span className="font-medium text-surface-700">
                      {countdown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={requestCode}
                    disabled={loading}
                    className="text-sm text-brand-500 hover:text-brand-700 font-medium disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setPassword("");
                  setConfirm("");
                }}
                className="w-full text-center text-sm text-surface-400 hover:text-surface-600 mt-3 transition-colors"
              >
                Use a different email
              </button>
            </div>

            <p className="text-center text-xs text-surface-400 mt-4">
              The code expires in 10 minutes. Check your spam folder if you do
              not see it.
            </p>
          </>
        )}

        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-10 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">
              Password reset
            </h1>
            <p className="text-surface-500 text-sm mb-8">
              Your password has been changed. Sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary w-full"
            >
              Go to sign in
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
