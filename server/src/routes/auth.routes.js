import { Router } from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validate.middleware.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import rateLimit from "express-rate-limit";

// Strict OTP rate limiter — 5 attempts per 10 minutes
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP attempts. Try again in 10 minutes.",
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

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-otp", otpLimiter, validateOtp, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.get("/me", protect, getMe);

export default router;
