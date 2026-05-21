import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    provider: { type: String, default: "local" },
    address: { type: String, required: true },
    phone: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    formattedAddress: { type: String },
    username: { type: String },
    profileImage: {
      type: String,
      default: null,
      // Note: Base64 encoded images are stored as strings
      // A typical 1MB image becomes ~1.33MB as base64
    },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
