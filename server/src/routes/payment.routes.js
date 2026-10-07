import { Router } from "express";
import {
  getPlans,
  initiatePayment,
  confirmPayment,
  getMyPayments,
  getListingPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/plans", getPlans);
router.use(protect);
router.post("/initiate", initiatePayment);
router.post("/confirm", confirmPayment);
router.get("/my-payments", getMyPayments);
router.get("/listing/:listingId", getListingPayments);
router.get("/all", adminOnly, getAllPayments);

export default router;
