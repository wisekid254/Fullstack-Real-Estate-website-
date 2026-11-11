import crypto from "crypto";
import OtpCode from "../models/OtpCode.js";

const OTP_EXPIRY = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashCode = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

// Cryptographically secure 6-digit code
export const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export const storeOTP = async (key, otp) => {
  await OtpCode.findOneAndUpdate(
    { key },
    {
      key,
      codeHash: hashCode(otp),
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const verifyOTP = async (key, inputOtp) => {
  const record = await OtpCode.findOne({ key });

  if (!record) {
    return {
      valid: false,
      message: "Code not found. Please request a new one.",
    };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await OtpCode.deleteOne({ _id: record._id });
    return {
      valid: false,
      message: "Code has expired. Please request a new one.",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await OtpCode.deleteOne({ _id: record._id });
    return {
      valid: false,
      message: "Too many attempts. Please request a new code.",
    };
  }

  const expected = Buffer.from(record.codeHash);
  const received = Buffer.from(hashCode(inputOtp));
  const matches =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!matches) {
    await OtpCode.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    return {
      valid: false,
      message:
        "Invalid code. " + Math.max(remaining, 0) + " attempts remaining.",
    };
  }

  await OtpCode.deleteOne({ _id: record._id });
  return { valid: true };
};

export const clearOTP = async (key) => {
  await OtpCode.deleteOne({ key });
};
