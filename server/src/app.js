import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import userRoutes from "./routes/user.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  sanitizeMongo,
  sanitizeXss,
  preventHpp,
} from "./middleware/security.middleware.js";

const app = express();

// ── Security headers ──────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Request logging ───────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // block huge JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Data sanitization ─────────────────────────────────────
app.use(sanitizeMongo); // block NoSQL injection
app.use(sanitizeXss); // strip XSS from input
app.use(preventHpp); // block HTTP parameter pollution

// ── Global rate limiting ──────────────────────────────────
app.use("/api", apiLimiter);

// ── Trust proxy (for accurate IPs behind nginx/render) ───
app.set("trust proxy", 1);

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV }),
);

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes); // stricter limit on auth
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

export default app;
