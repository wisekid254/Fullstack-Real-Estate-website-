import { Router } from "express";
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getFeaturedListings,
  getUserListings,
} from "../controllers/listing.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getListings);
router.get("/featured", getFeaturedListings);
router.get("/user/:userId", getUserListings);
router.get("/:id", getListing);
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
