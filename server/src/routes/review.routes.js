import { Router } from "express";
import {
  getListingReviews,
  createReview,
  markHelpful,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/listing/:listingId", getListingReviews);
router.post("/listing/:listingId", protect, createReview);
router.put("/:id/helpful", protect, markHelpful);
router.delete("/:id", protect, deleteReview);

export default router;
