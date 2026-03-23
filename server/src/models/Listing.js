import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    type: { type: String, enum: ["sale", "rent"], required: true },
    category: {
      type: String,
      enum: ["house", "apartment", "villa", "land", "commercial"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "rented", "inactive"],
      default: "active",
    },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      country: { type: String, default: "Kenya" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    features: {
      bedrooms: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      area: { type: Number, default: 0 }, // square metres
      parking: { type: Number, default: 0 },
      furnished: { type: Boolean, default: false },
      yearBuilt: { type: Number, default: null },
    },

    amenities: [{ type: String }], // e.g. ['Pool', 'Gym', 'Security']

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" }, // Cloudinary public_id
      },
    ],

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Text index for full-text search
listingSchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.address": "text",
});

// Regular indexes for fast filtering
listingSchema.index({ type: 1, status: 1 });
listingSchema.index({ "location.city": 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ featured: 1 });

export default mongoose.model("Listing", listingSchema);
