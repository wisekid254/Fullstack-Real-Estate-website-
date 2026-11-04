import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";

// ── GET /api/listings ─────────────────────────────────────
export const getListings = async (req, res) => {
  const {
    type,
    category,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    furnished,
    featured,
    search,
    sort = "-createdAt",
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status: "active" };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (city) filter["location.city"] = new RegExp(city, "i");
  if (featured) filter.featured = featured === "true";
  if (furnished) filter["features.furnished"] = furnished === "true";
  if (bedrooms) filter["features.bedrooms"] = { $gte: Number(bedrooms) };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Listing.countDocuments(filter);

  const listings = await Listing.find(filter)
    .populate("agent", "name email avatar phone")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: listings.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    page: Number(page),
    listings,
  });
};

// ── GET /api/listings/:id ─────────────────────────────────
export const getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    "agent",
    "name email avatar phone",
  );

  if (!listing) throw new ApiError("Listing not found", 404);

  // Increment view count silently
  await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, listing });
};

// ── POST /api/listings ────────────────────────────────────
export const createListing = async (req, res) => {
  const listing = await Listing.create({
    ...req.body,
    agent: req.user._id,
  });

  res.status(201).json({ success: true, listing });
};

// ── PUT /api/listings/:id ─────────────────────────────────
export const updateListing = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError("Listing not found", 404);

  // Only the agent who created it or an admin can update
  if (
    listing.agent.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError("Not authorised to update this listing", 403);
  }

  listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, listing });
};

// ── DELETE /api/listings/:id ──────────────────────────────
export const deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError("Listing not found", 404);

  if (
    listing.agent.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError("Not authorised to delete this listing", 403);
  }

  await listing.deleteOne();
  res.json({ success: true, message: "Listing deleted" });
};

// ── GET /api/listings/featured ────────────────────────────
export const getFeaturedListings = async (req, res) => {
  const listings = await Listing.find({ featured: true, status: "active" })
    .populate("agent", "name avatar")
    .sort("-createdAt")
    .limit(6);

  res.json({ success: true, listings });
};

// ── GET /api/listings/user/:userId ────────────────────────
export const getUserListings = async (req, res) => {
  const listings = await Listing.find({ agent: req.params.userId }).sort(
    "-createdAt",
  );

  res.json({ success: true, count: listings.length, listings });
};
