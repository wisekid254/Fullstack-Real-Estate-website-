import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";

// POST /api/inquiries
export const createInquiry = async (req, res) => {
  const { listingId, name, email, phone, message } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError("Listing not found", 404);

  const inquiry = await Inquiry.create({
    listing: listingId,
    agent: listing.agent,
    sender: req.user?._id || null,
    name,
    email,
    phone,
    message,
  });

  res.status(201).json({ success: true, inquiry });
};

// GET /api/inquiries/mine  (agent sees their inquiries)
export const getMyInquiries = async (req, res) => {
  const inquiries = await Inquiry.find({ agent: req.user._id })
    .populate("listing", "title images location")
    .sort("-createdAt");
  res.json({ success: true, count: inquiries.length, inquiries });
};
