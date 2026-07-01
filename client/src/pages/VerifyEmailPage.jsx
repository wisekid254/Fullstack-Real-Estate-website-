import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { verifySignupOtpThunk, clearOTPState } from "../store/authSlice";
import authService from "../services/authService";

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    loading,
    error,
    requiresVerification,
    pendingEmail,
    isAuthenticated,
  } = useSelector((s) => s.auth);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!requiresVerification) navigate("/register");
  }, [requiresVerification, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    const result = await dispatch(
      verifySignupOtpThunk({ email: pendingEmail, otp: code }),
    );
    if (verifySignupOtpThunk.fulfilled.match(result)) {
      toast.success("Email verified! Welcome to nestHaven.");
      dispatch(clearOTPState());
      navigate("/");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await authService.resendOtp(pendingEmail, "signup");
      toast.success("New code sent to your email");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
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
            Verify your email
          </h1>
          <p className="text-surface-600 text-sm">We sent a 6-digit code to</p>
          <p className="text-surface-900 font-medium text-sm mt-1">
            {pendingEmail}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-0 ${
                    digit
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-surface-200 bg-white text-surface-900 focus:border-brand-400"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="btn-primary w-full mb-4 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify and continue"}
            </button>
          </form>

          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            ) : (
              <p className="text-sm text-surface-500">
                Resend code in{" "}
                <span className="font-medium text-surface-700">
                  {countdown}s
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(clearOTPState());
              navigate("/register");
            }}
            className="w-full text-center text-sm text-surface-400 hover:text-surface-600 mt-4 transition-colors"
          >
            ← Back to register
          </button>
        </div>

        <p className="text-center text-xs text-surface-400 mt-4">
          The code expires in 10 minutes. Check your spam folder if you don't
          see it.
        </p>
      </motion.div>
    </div>
  );
}
