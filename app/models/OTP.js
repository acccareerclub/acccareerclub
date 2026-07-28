// app/models/OTP.js
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    expiry: {
      type: Date,
      required: [true, "Expiry is required"],
      index: { expires: 0 }, // TTL index - auto delete after expiry
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Max 5 attempts
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookups
OTPSchema.index({ email: 1, otp: 1 });

// Auto-delete expired OTPs after 10 minutes
// The TTL index on expiry will handle this automatically
OTPSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

console.log("✅ OTP schema created");

// Hide sensitive fields in JSON responses
OTPSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Check if model exists before creating a new one
const OTP = mongoose.models.OTP || mongoose.model("OTP", OTPSchema);

export default OTP;