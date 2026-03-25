import { Router } from "express";
import {
  createInquiry,
  getMyInquiries,
} from "../controllers/inquiry.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createInquiry);
router.get("/mine", protect, getMyInquiries);

export default router;
