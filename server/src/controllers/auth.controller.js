import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { generateOTP, storeOTP, verifyOTP } from "../utils/otpStore.js";

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    throw new ApiError("Please provide name, email and password", 400);

  const userExists = await User.findOne({ email });
  if (userExists) throw new ApiError("Email already registered", 400);

  const allowedRoles = ["user", "agent"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const user = await User.create({ name, email, password, role: userRole });

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ to: email, name }).catch(console.error);

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// POST /api/auth/login  — Step 1: verify credentials, send OTP
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    throw new ApiError("Invalid email or password", 401);

  // Generate and store OTP
  const otp = generateOTP();
  storeOTP(email, otp);

  // Send OTP email
  // try {
  //   await sendOTPEmail({ to: email, name: user.name, otp });
  // } catch (err) {
  //   throw new ApiError(
  //     "Failed to send verification email. Please try again.",
  //     500,
  //   );
  // }
  try {
    await sendOTPEmail({ to: email, name: user.name, otp });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }

  res.json({
    success: true,
    requiresOTP: true,
    message: "Verification code sent to your email",
    email: user.email, // return email so frontend can use it
  });
};

// POST /api/auth/verify-otp  — Step 2: verify OTP, return token
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError("Email and OTP are required", 400);

  const result = verifyOTP(email, otp);
  if (!result.valid) throw new ApiError(result.message, 400);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("User not found", 404);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("User not found", 404);

  const otp = generateOTP();
  storeOTP(email, otp);

  try {
    await sendOTPEmail({ to: email, name: user.name, otp });
  } catch (err) {
    throw new ApiError("Failed to send verification email", 500);
  }

  res.json({ success: true, message: "New verification code sent" });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};
