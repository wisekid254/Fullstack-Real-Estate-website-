// Simple in-memory OTP store
// In production you would use Redis for this
const otpStore = new Map();

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5; // max wrong attempts before lockout

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY,
    attempts: 0,
  });
};

export const verifyOTP = (email, inputOtp) => {
  const record = otpStore.get(email);

  if (!record) {
    return {
      valid: false,
      message: "OTP not found. Please request a new one.",
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return {
      valid: false,
      message: "OTP has expired. Please request a new one.",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    return {
      valid: false,
      message: "Too many attempts. Please request a new OTP.",
    };
  }

  if (record.otp !== inputOtp) {
    record.attempts += 1;
    return {
      valid: false,
      message: `Invalid code. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
    };
  }

  otpStore.delete(email);
  return { valid: true };
};

export const clearOTP = (email) => {
  otpStore.delete(email);
};

// Clean up expired OTPs every 15 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [email, record] of otpStore.entries()) {
      if (now > record.expiresAt) otpStore.delete(email);
    }
  },
  15 * 60 * 1000,
);
