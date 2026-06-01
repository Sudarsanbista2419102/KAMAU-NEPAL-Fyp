import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProfessionalModel from './models/professionalModel.js';

dotenv.config({ path: './.env' });

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const pros = await ProfessionalModel.find({}, 'firstName profileImage coverImage');
    console.log('Professionals images in DB:', pros);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkImages();
