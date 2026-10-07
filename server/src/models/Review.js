import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    aspects: {
      value: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      condition: { type: Number, min: 1, max: 5 },
      amenities: { type: Number, min: 1, max: 5 },
    },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ listing: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
