import { Router } from "express";
import {
  createInquiry,
  getMyInquiries,
} from "../controllers/inquiry.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateInquiry } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validateInquiry, createInquiry);
router.get("/mine", protect, getMyInquiries);

export default router;
