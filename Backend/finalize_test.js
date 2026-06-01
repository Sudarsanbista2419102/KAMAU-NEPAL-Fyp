import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/bookingModel.js";
import User from "./models/userModel.js";

dotenv.config({ path: "./.env" });

async function finalizeTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Confirm the booking
    const bookingId = "69d1f5021ff491f74adb186c";
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = "Confirmed";
      await booking.save();
      console.log("✅ Booking confirmed:", bookingId);
    } else {
      console.log("❌ Booking not found:", bookingId);
    }

    // 2. Get OTP for the latest test user
    const users = await User.find({ email: /testuser_ai/ }).sort({ createdAt: -1 }).limit(2);
    users.forEach(u => {
      console.log(`USER: ${u.email}, OTP: ${u.otp}, isVerified: ${u.isVerified}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

finalizeTest();
