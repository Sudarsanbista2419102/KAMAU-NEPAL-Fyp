import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProfessionalModel from './models/professionalModel.js';

dotenv.config({ path: './.env' });

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const categories = await ProfessionalModel.distinct('serviceCategory');
    console.log('ALL CATEGORIES IN DB:', categories);
    
    const pros = await ProfessionalModel.find({}, 'name serviceCategory isVerified');
    console.log('ALL PROFESSIONALS IN DB:', pros);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCategories();
