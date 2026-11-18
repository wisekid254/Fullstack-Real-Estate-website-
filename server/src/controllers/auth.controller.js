import { OAuth2Client } from "google-auth-library";
import validator from "validator";
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

const googleClient = new OAuth2Client();

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
  if (!user) throw new ApiError("Invalid email or password", 401);

  // Accounts created through Google have no password
  if (!user.password) {
    throw new ApiError(
      'This account uses Google sign-in. Click "Continue with Google", or use "Forgot password" to set a password.',
      400,
    );
  }

  if (!(await user.matchPassword(password)))
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

// POST /api/auth/google
export const googleAuth = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) throw new ApiError("Google credential is required", 400);

  if (!process.env.GOOGLE_CLIENT_ID)
    throw new ApiError("Google sign-in is not configured on the server", 500);

  // Google verifies the signature, expiry and that the token was issued for OUR client ID
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("Google token verification failed:", err.message);
    throw new ApiError("Google sign-in failed. Please try again.", 401);
  }

  if (!payload || !payload.email || !payload.email_verified)
    throw new ApiError("Your Google email address is not verified", 400);

  const googleId = payload.sub;
  const email =
    validator.normalizeEmail(payload.email) || payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];
  const picture = payload.picture || "";

  let user = await User.findOne({ googleId });
  let isNewUser = false;

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // An account with this email already exists: link it to Google
      if (user.googleId && user.googleId !== googleId)
        throw new ApiError(
          "This email is linked to a different Google account",
          400,
        );

      user.googleId = googleId;

      // If the email was never verified, whoever set the password never proved they own
      // the address. Remove that password so it cannot be used to take over the account.
      if (!user.isVerified) {
        user.password = undefined;
        user.isVerified = true;
      }

      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    } else {
      const allowedRoles = ["user", "agent"];

      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: allowedRoles.includes(role) ? role : "user",
        isVerified: true,
      });
      isNewUser = true;

      sendWelcomeEmail({ to: email, name }).catch((err) => {
        console.error("Welcome email error:", err.message);
      });
    }
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: publicUser(user),
    isNewUser,
  });
};

// POST /api/auth/resend-otp
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
