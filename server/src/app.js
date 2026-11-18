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
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";

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

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const allowedOrigins = new Set([
  "https://fullstack-real-estate-website.vercel.app",

  "https://fullstack-real-estate-website-lijcdhcii-wisekid254s-projects.vercel.app",

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
]);

// Add CLIENT_URL from Render environment variables.
if (process.env.CLIENT_URL) {
  allowedOrigins.add(process.env.CLIENT_URL.trim().replace(/\/$/, ""));
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    // Allow explicitly authorized frontend origins.
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.error("CORS rejected origin:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

// Apply CORS before all other middleware and routes.
app.use(cors(corsOptions));

// ==========================================
// 2. SECURITY HEADERS
// ==========================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: ["'self'", "'unsafe-inline'"],

        styleSrc: ["'self'", "'unsafe-inline'", "https:"],

        imgSrc: ["'self'", "data:", "https:", "http:"],

        connectSrc: ["'self'", "https:"],

        fontSrc: ["'self'", "https:", "data:"],

        objectSrc: ["'none'"],
      },
    },
  }),
);

// ==========================================
// 3. REQUEST LOGGING
// ==========================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ==========================================
// 4. BODY PARSING
// ==========================================

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

// ==========================================
// 5. DATA SANITIZATION
// ==========================================

app.use(sanitizeMongo);
app.use(sanitizeXss);
app.use(preventHpp);

// ==========================================
// 6. PROXY CONFIGURATION
// ==========================================

app.set("trust proxy", 1);

// ==========================================
// 7. API RATE LIMITING
// ==========================================

app.use("/api", apiLimiter);

// ==========================================
// 8. HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    env: process.env.NODE_ENV,
    message: "NestHaven API is running",
  });
});

// ==========================================
// 9. API ROUTES
// ==========================================

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/listings", listingRoutes);

app.use("/api/users", userRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/upload", uploadLimiter, uploadRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

// ==========================================
// 10. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// 11. GLOBAL ERROR HANDLER
// ==========================================

app.use(errorHandler);

// ==========================================
// EXPORT APPLICATION
// ==========================================

export default app;
