import { Router } from "express";
import {
  register,
  login,
  verifyOtp,
  verifySignupOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  passwordRules,
  validate,
} from "../middleware/validate.middleware.js";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many attempts. Try again in 10 minutes.",
  },
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many reset requests. Try again in 15 minutes.",
  },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many reset attempts. Try again in 15 minutes.",
  },
});

const validateOtp = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
  validate,
];

const validateEmailOnly = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  validate,
];

const validateReset = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("otp")
    .notEmpty()
    .withMessage("Code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Code must be 6 digits")
    .isNumeric()
    .withMessage("Code must be numeric"),
  passwordRules("password"),
  validate,
];

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-signup-otp", otpLimiter, validateOtp, verifySignupOtp);
router.post("/verify-otp", otpLimiter, validateOtp, verifyOtp);
router.post("/resend-otp", otpLimiter, validateEmailOnly, resendOtp);
router.post(
  "/forgot-password",
  forgotLimiter,
  validateEmailOnly,
  forgotPassword,
);
router.post("/reset-password", resetLimiter, validateReset, resetPassword);
router.get("/me", protect, getMe);

export default router;
