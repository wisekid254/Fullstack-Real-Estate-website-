import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Security & logging
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/users", userRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// Global error handler — must be last
app.use(errorHandler);

export default app;
