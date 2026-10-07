import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    method: { type: String, enum: ["mpesa", "card", "bank"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    plan: {
      type: String,
      enum: ["featured_7", "featured_30", "premium_7", "premium_30"],
      required: true,
    },
    reference: { type: String, unique: true },
    mpesaCode: { type: String, default: "" },
    phone: { type: String, default: "" },
    expiresAt: { type: Date },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
