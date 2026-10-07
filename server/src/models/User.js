import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "agent", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },

    agentProfile: {
      bio: { type: String, default: "", maxlength: 1000 },
      title: { type: String, default: "Real Estate Agent" },
      brokerage: { type: String, default: "" },
      license: { type: String, default: "" },
      experience: { type: Number, default: 0 },
      teamType: {
        type: String,
        enum: ["individual", "team"],
        default: "individual",
      },
      minPrice: { type: Number, default: 0 },
      maxPrice: { type: Number, default: 0 },
      salesLast12: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      isTopAgent: { type: Boolean, default: false },
      specializations: [{ type: String }],
      serviceAreas: [{ type: String }],
      languages: [{ type: String }],
      responseTime: { type: String, default: "Within 24 hours" },
      verified: { type: Boolean, default: false },
      social: {
        website: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        facebook: { type: String, default: "" },
      },
    },

    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password") === false) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.updateRating = async function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
  await this.save();
};

export default mongoose.model("User", userSchema);
