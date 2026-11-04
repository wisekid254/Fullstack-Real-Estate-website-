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
import ApiError from "../utils/ApiError.js";

const router = Router();

// ── Public: get all agents ────────────────────────────────
router.get("/agents", async (req, res) => {
  const agents = await User.find({
    role: { $in: ["agent", "admin"] },
  }).select(
    "name email avatar phone role createdAt rating numReviews agentProfile",
  );

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

// ── Public: get single agent profile ─────────────────────
router.get("/agents/:id", async (req, res) => {
  const agent = await User.findById(req.params.id).select("-password");

  if (!agent || !["agent", "admin"].includes(agent.role))
    throw new ApiError("Agent not found", 404);

  const listings = await Listing.find({
    agent: agent._id,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .limit(6);

  const totalListings = await Listing.countDocuments({ agent: agent._id });

  res.json({
    success: true,
    agent: {
      ...agent.toObject(),
      listingCount: listings.length,
      totalListings,
    },
    listings,
  });
});

// ── Public: add a review to an agent ─────────────────────
router.post("/agents/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment)
    throw new ApiError("Rating and comment are required", 400);

  const agent = await User.findById(req.params.id);
  if (!agent) throw new ApiError("Agent not found", 404);

  const alreadyReviewed = agent.reviews.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );
  if (alreadyReviewed)
    throw new ApiError("You have already reviewed this agent", 400);

  agent.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  await agent.updateRating();

  res.status(201).json({ success: true, message: "Review added" });
});

// ── Protected: update agent profile ──────────────────────
router.put("/agent-profile", protect, async (req, res) => {
  const {
    phone,
    bio,
    title,
    brokerage,
    license,
    experience,
    teamType,
    minPrice,
    maxPrice,
    salesLast12,
    totalSales,
    specializations,
    serviceAreas,
    languages,
    responseTime,
    social,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError("User not found", 404);

  if (phone) user.phone = phone;

  user.agentProfile = {
    bio: bio ?? user.agentProfile?.bio ?? "",
    title: title ?? user.agentProfile?.title ?? "Real Estate Agent",
    brokerage: brokerage ?? user.agentProfile?.brokerage ?? "",
    license: license ?? user.agentProfile?.license ?? "",
    experience: experience ?? user.agentProfile?.experience ?? 0,
    teamType: teamType ?? user.agentProfile?.teamType ?? "individual",
    minPrice: minPrice ?? user.agentProfile?.minPrice ?? 0,
    maxPrice: maxPrice ?? user.agentProfile?.maxPrice ?? 0,
    salesLast12: salesLast12 ?? user.agentProfile?.salesLast12 ?? 0,
    totalSales: totalSales ?? user.agentProfile?.totalSales ?? 0,
    specializations:
      specializations ?? user.agentProfile?.specializations ?? [],
    serviceAreas: serviceAreas ?? user.agentProfile?.serviceAreas ?? [],
    languages: languages ?? user.agentProfile?.languages ?? [],
    responseTime:
      responseTime ?? user.agentProfile?.responseTime ?? "Within 24 hours",
    social: social ?? user.agentProfile?.social ?? {},
    verified: user.agentProfile?.verified ?? false,
    isTopAgent: user.agentProfile?.isTopAgent ?? false,
  };

  await user.save();
  res.json({ success: true, user });
});

// ── Protected routes ──────────────────────────────────────
router.use(protect);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/saved", getSavedListings);
router.post("/save/:listingId", saveListing);
router.put("/change-password", changePassword);

export default router;
