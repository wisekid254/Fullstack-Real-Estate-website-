import Payment from "../models/Payment.js";
import Listing from "../models/Listing.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.controller.js";
import crypto from "crypto";

const PLANS = {
  featured_7: {
    label: "Featured — 7 days",
    amount: 2500,
    days: 7,
    featured: true,
  },
  featured_30: {
    label: "Featured — 30 days",
    amount: 8000,
    days: 30,
    featured: true,
  },
  premium_7: {
    label: "Premium — 7 days",
    amount: 5000,
    days: 7,
    featured: false,
  },
  premium_30: {
    label: "Premium — 30 days",
    amount: 15000,
    days: 30,
    featured: false,
  },
};

// GET /api/payments/plans
export const getPlans = async (req, res) => {
  res.json({ success: true, plans: PLANS });
};

// POST /api/payments/initiate
export const initiatePayment = async (req, res) => {
  const { listingId, plan, method, phone } = req.body;

  if (!PLANS[plan]) throw new ApiError("Invalid plan", 400);

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError("Listing not found", 404);

  if (
    listing.agent.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  )
    throw new ApiError("You can only promote your own listings", 403);

  const reference =
    "NH" + Date.now() + crypto.randomBytes(3).toString("hex").toUpperCase();
  const planInfo = PLANS[plan];

  const payment = await Payment.create({
    user: req.user._id,
    listing: listingId,
    amount: planInfo.amount,
    method: method || "mpesa",
    plan,
    reference,
    phone: phone || "",
    description: planInfo.label + " for: " + listing.title,
    status: "pending",
  });

  res.json({
    success: true,
    payment,
    reference,
    amount: planInfo.amount,
    message:
      method === "mpesa"
        ? "Send KES " +
          planInfo.amount +
          " to Till/Paybill 123456, reference: " +
          reference
        : "Complete payment with reference: " + reference,
  });
};

// POST /api/payments/confirm
export const confirmPayment = async (req, res) => {
  const { reference, mpesaCode } = req.body;

  const payment = await Payment.findOne({ reference })
    .populate("listing", "title")
    .populate("user", "name email");

  if (!payment) throw new ApiError("Payment not found", 404);

  if (payment.status === "completed")
    throw new ApiError("Payment already confirmed", 400);

  const planInfo = PLANS[payment.plan];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + planInfo.days);

  payment.status = "completed";
  payment.mpesaCode = mpesaCode || "";
  payment.expiresAt = expiresAt;
  await payment.save();

  // Update the listing
  await Listing.findByIdAndUpdate(payment.listing._id, {
    featured: planInfo.featured ? true : undefined,
    status: "active",
    featuredUntil: expiresAt,
  });

  // Notify the user
  await createNotification({
    userId: payment.user._id,
    type: "payment_success",
    title: "Payment confirmed",
    message:
      'Your listing "' +
      payment.listing.title +
      '" has been promoted for ' +
      planInfo.days +
      " days.",
    link: "/listings/" + payment.listing._id,
    data: { reference, plan: payment.plan, amount: payment.amount },
  });

  res.json({
    success: true,
    payment,
    message: "Payment confirmed. Listing promoted!",
  });
};

// GET /api/payments/my-payments
export const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("listing", "title images")
    .sort({ createdAt: -1 });

  res.json({ success: true, payments });
};

// GET /api/payments/listing/:listingId
export const getListingPayments = async (req, res) => {
  const payments = await Payment.find({
    listing: req.params.listingId,
    status: "completed",
  }).sort({ createdAt: -1 });

  res.json({ success: true, payments });
};

// Admin: GET /api/payments/all
export const getAllPayments = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const payments = await Payment.find()
    .populate("user", "name email")
    .populate("listing", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments();
  const revenue = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.json({
    success: true,
    payments,
    total,
    revenue: revenue[0]?.total || 0,
    page,
    pages: Math.ceil(total / limit),
  });
};
