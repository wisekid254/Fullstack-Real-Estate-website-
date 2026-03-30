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

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV }),
);

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use(errorHandler);

export default app;
