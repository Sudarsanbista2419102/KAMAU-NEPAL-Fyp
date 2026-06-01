import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/bookingModel.js';

dotenv.config({ path: './.env' });

async function acceptBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find the latest pending booking for Sudarsan Bista
    const booking = await Booking.findOne({ 
      professionalId: new mongoose.Types.ObjectId("69c8cf197201f9eea519791f"),
      status: "Pending"
    }).sort({ createdAt: -1 });

    if (booking) {
      console.log('FOUND BOOKING:', booking._id);
      booking.status = "Confirmed";
      await booking.save();
      console.log('BOOKING CONFIRMED SUCCESS');
    } else {
      console.log('No pending booking found for this professional.');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

acceptBooking();
