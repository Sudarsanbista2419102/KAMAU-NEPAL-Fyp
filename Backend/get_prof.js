import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Professional from './models/professionalModel.js';

dotenv.config({ path: './.env' });

async function findProfessional() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const prof = await Professional.findOne({ firstName: 'Sudarsan', lastName: 'Bista' });
    if (prof) {
      console.log('PROFESSIONAL_ID:', prof._id);
      console.log('USER_ID:', prof.userId);
      const user = await User.findById(prof.userId);
      if (user) {
        console.log('EMAIL:', user.email);
        // We don't know the password, but we can manually verify/accept the booking in the DB
        // or just set a known password for testing.
      }
    } else {
      console.log('Professional not found');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findProfessional();
