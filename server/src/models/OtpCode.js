import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("OtpCode", otpCodeSchema);
