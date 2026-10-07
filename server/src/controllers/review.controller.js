import Review from "../models/Review.js";
import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.controller.js";

// GET /api/reviews/listing/:listingId
export const getListingReviews = async (req, res) => {
  const reviews = await Review.find({ listing: req.params.listingId })
    .sort({ createdAt: -1 })
    .limit(50);

  const total = reviews.length;
  const avg =
    total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) /
        10
      : 0;

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  });

  res.json({
    success: true,
    reviews,
    total,
    averageRating: avg,
    distribution: dist,
  });
};

// POST /api/reviews/listing/:listingId
export const createReview = async (req, res) => {
  const { rating, title, comment, aspects } = req.body;

  if (!rating || !title || !comment)
    throw new ApiError("Rating, title and comment are required", 400);

  const listing = await Listing.findById(req.params.listingId).populate(
    "agent",
  );
  if (!listing) throw new ApiError("Listing not found", 404);

  const existing = await Review.findOne({
    listing: req.params.listingId,
    user: req.user._id,
  });
  if (existing)
    throw new ApiError("You have already reviewed this property", 400);

  const review = await Review.create({
    listing: req.params.listingId,
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar,
    rating: Number(rating),
    title,
    comment,
    aspects: aspects || {},
    verified: false,
  });

  // Notify the agent
  if (listing.agent) {
    await createNotification({
      userId: listing.agent._id,
      type: "review_received",
      title: "New property review",
      message:
        req.user.name +
        " left a " +
        rating +
        '-star review on "' +
        listing.title +
        '"',
      link: "/listings/" + listing._id,
      data: { rating, listingTitle: listing.title },
    });
  }

  res.status(201).json({ success: true, review });
};

// PUT /api/reviews/:id/helpful
export const markHelpful = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError("Review not found", 404);

  const index = review.helpful.indexOf(req.user._id);
  if (index === -1) {
    review.helpful.push(req.user._id);
  } else {
    review.helpful.splice(index, 1);
  }
  await review.save();

  res.json({ success: true, helpful: review.helpful.length });
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError("Review not found", 404);

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  )
    throw new ApiError("Not authorized", 403);

  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
};
