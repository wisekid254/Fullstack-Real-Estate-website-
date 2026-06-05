import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// ── Rate limiters ─────────────────────────────────────────

// General API — 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes — 10 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload routes — 20 uploads per hour per IP
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Upload limit reached, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Data sanitizers ───────────────────────────────────────

// Prevent NoSQL injection attacks like { $gt: '' }
export const sanitizeMongo = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt blocked: ${key} from ${req.ip}`);
  },
});

// Prevent XSS attacks — strip HTML tags from input
export const sanitizeXss = xss();

// Prevent HTTP parameter pollution
export const preventHpp = hpp({
  whitelist: ["price", "bedrooms", "bathrooms", "sort", "page", "limit"],
});
