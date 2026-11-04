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
import { validateListing } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", getListings);
router.get("/featured", getFeaturedListings);
router.get("/user/:userId", getUserListings);
router.get("/:id", getListing);
router.post("/", protect, validateListing, createListing);
router.put("/:id", protect, validateListing, updateListing);
router.delete("/:id", protect, deleteListing);

export default router;
