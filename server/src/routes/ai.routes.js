import { Router } from "express";
import {
  valuateListing,
  naturalLanguageSearch,
  chatWithAI,
  generateDescription,
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

// AI rate limiter — 20 requests per hour per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "AI request limit reached. Try again in an hour.",
  },
});

const router = Router();

router.get("/valuate/:id", aiLimiter, valuateListing);
router.post("/search", aiLimiter, naturalLanguageSearch);
router.post("/chat", aiLimiter, chatWithAI);
router.post("/generate-description", aiLimiter, protect, generateDescription);

export default router;
