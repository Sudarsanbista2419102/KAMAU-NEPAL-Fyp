import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/bookingModel.js';

dotenv.config({ path: './.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('BOOKINGS FOUND:', bookings.length);
    bookings.forEach(b => {
      console.log(`ID: ${b._id}, status: ${b.status}, user: ${b.fullName}, professionalId: ${b.professionalId}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
