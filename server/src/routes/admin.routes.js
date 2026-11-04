import { Router } from "express";
import {
  getStats,
  getAllListings,
  adminUpdateListing,
  adminDeleteListing,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllInquiries,
  markInquiryRead,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, adminOnly); // every admin route requires auth + admin role

router.get("/stats", getStats);
router.get("/listings", getAllListings);
router.put("/listings/:id", adminUpdateListing);
router.delete("/listings/:id", adminDeleteListing);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/inquiries", getAllInquiries);
router.put("/inquiries/:id/read", markInquiryRead);

export default router;
