import { Router } from "express";
import {
  getProfile,
  updateProfile,
  saveListing,
  getSavedListings,
  changePassword,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

const router = Router();

// ── Public route — no auth needed ─────────────────────────
router.get("/agents", async (req, res) => {
  const agents = await User.find({
    role: { $in: ["agent", "admin"] },
  }).select("name email avatar phone role createdAt");

  // Get listing count for each agent
  const agentsWithCount = await Promise.all(
    agents.map(async (agent) => {
      const listingCount = await Listing.countDocuments({
        agent: agent._id,
        status: "active",
      });
      return { ...agent.toObject(), listingCount };
    }),
  );

  res.json({ success: true, agents: agentsWithCount });
});

// ── Protected routes — auth required ──────────────────────
router.use(protect);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/saved", getSavedListings);
router.post("/save/:listingId", saveListing);
router.put("/change-password", changePassword);

export default router;
