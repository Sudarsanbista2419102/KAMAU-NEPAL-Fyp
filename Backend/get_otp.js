import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import path from 'path';

dotenv.config({ path: './.env' });

async function findOtp() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'testuser_ai@example.com' });
    if (user) {
      console.log('USER_ID:', user._id);
      console.log('OTP:', user.otp);
    } else {
      console.log('User not found');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findOtp();
