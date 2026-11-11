import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";
import {
  sendOTPEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/emailService.js";
import { generateOTP, storeOTP, verifyOTP } from "../utils/otpStore.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    throw new ApiError("Please provide name, email and password", 400);

  const userExists = await User.findOne({ email });
  if (userExists) throw new ApiError("Email already registered", 400);

  const allowedRoles = ["user", "agent"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    isVerified: false,
  });

  const otp = generateOTP();
  await storeOTP("signup:" + email, otp);

  try {
    await sendVerificationEmail({ to: email, name, otp });
  } catch (err) {
    console.error("Verification email error:", err.message);
    throw new ApiError(
      "Failed to send verification email. Please try again.",
      500,
    );
  }

  res.status(201).json({
    success: true,
    requiresVerification: true,
    email: user.email,
    message: "Verification code sent to your email",
  });
};

// POST /api/auth/verify-signup-otp
export const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError("Email and OTP are required", 400);

  const result = await verifyOTP("signup:" + email, otp);
  if (!result.valid) throw new ApiError(result.message, 400);

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true },
  );
  if (!user) throw new ApiError("User not found", 404);

  sendWelcomeEmail({ to: email, name: user.name }).catch(console.error);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: publicUser(user),
  });
};

// POST /api/auth/login (step 1)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    throw new ApiError("Invalid email or password", 401);

  if (!user.isVerified) {
    const signupOtp = generateOTP();
    await storeOTP("signup:" + email, signupOtp);
    sendVerificationEmail({ to: email, name: user.name, otp: signupOtp }).catch(
      console.error,
    );

    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message: "Please verify your email first. A new code has been sent.",
    });
  }

  const otp = generateOTP();
  await storeOTP("login:" + email, otp);

  try {
    await sendOTPEmail({ to: email, name: user.name, otp });
  } catch (err) {
    console.error("Login OTP email error:", err.message);
    throw new ApiError(
      "Failed to send verification email. Please try again.",
      500,
    );
  }

  res.json({
    success: true,
    requiresOTP: true,
    message: "Verification code sent to your email",
    email: user.email,
  });
};

// POST /api/auth/verify-otp (step 2)
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError("Email and OTP are required", 400);

  const result = await verifyOTP("login:" + email, otp);
  if (!result.valid) throw new ApiError(result.message, 400);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("User not found", 404);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: publicUser(user),
  });
};

// POST /api/auth/resend-otp
// Responds the same whether or not the account exists
export const resendOtp = async (req, res) => {
  const { email, purpose = "login" } = req.body;

  if (!email) throw new ApiError("Email is required", 400);

  const allowedPurposes = ["login", "signup"];
  if (!allowedPurposes.includes(purpose))
    throw new ApiError("Invalid purpose", 400);

  const user = await User.findOne({ email });

  if (user) {
    const otp = generateOTP();
    await storeOTP(purpose + ":" + email, otp);

    try {
      if (purpose === "signup") {
        await sendVerificationEmail({ to: email, name: user.name, otp });
      } else {
        await sendOTPEmail({ to: email, name: user.name, otp });
      }
    } catch (err) {
      console.error("Resend OTP email error:", err.message);
      throw new ApiError("Failed to send verification email", 500);
    }
  }

  res.json({
    success: true,
    message: "If the account exists, a new code has been sent",
  });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError("Email is required", 400);

  const user = await User.findOne({ email });

  if (user) {
    const otp = generateOTP();
    await storeOTP("reset:" + email, otp);

    sendPasswordResetEmail({ to: email, name: user.name, otp }).catch((err) => {
      console.error("Password reset email error:", err.message);
    });
  }

  res.json({
    success: true,
    message: "If an account exists for that email, a reset code has been sent.",
  });
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password)
    throw new ApiError("Email, code and new password are required", 400);

  const result = await verifyOTP("reset:" + email, otp);
  if (!result.valid) throw new ApiError(result.message, 400);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("Invalid or expired code", 400);

  user.password = password;
  user.isVerified = true;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};
