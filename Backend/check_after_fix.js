import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import UserModel from './models/userModel.js';
import ProfessionalModel from './models/professionalModel.js';
import CategoryModel from './models/categoryModel.js';

async function checkAfterFix() {
  try {
    console.log('\n=== CHECKING DATA AFTER FIX ===\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Check users
    console.log('--- USER VERIFICATION STATUS ---');
    const users = await UserModel.find({}).limit(5);
    users.forEach((user, i) => {
      console.log(`${i+1}. ${user.email}`);
      console.log(`   verified field: ${user.verified}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
    });

    const verifiedCount = await UserModel.countDocuments({ verified: true });
    console.log(`\nTotal verified users in DB: ${verifiedCount}\n`);

    // Check professionals
    console.log('--- PROFESSIONAL DATA ---');
    const profs = await ProfessionalModel.find({}).limit(3);
    profs.forEach((prof, i) => {
      console.log(`${i+1}. firstName: "${prof.firstName}"`);
      console.log(`   lastName: "${prof.lastName}"`);
      console.log(`   name field: "${prof.name || 'N/A'}"`);
      console.log(`   Phone: ${prof.phone}`);
    });

    // Check categories
    console.log('\n--- CATEGORY DATA ---');
    const cats = await CategoryModel.find({}).limit(3);
    cats.forEach((cat, i) => {
      console.log(`${i+1}. name: "${cat.name}"`);
      console.log(`   image: "${cat.image}"`);
    });

    // Direct check for verified=true
    console.log('\n--- DIRECT QUERY TEST ---');
    const verifiedUsers = await UserModel.find({ verified: true });
    console.log(`Users with verified=true: ${verifiedUsers.length}`);
    if (verifiedUsers.length > 0) {
      console.log(`Sample: ${verifiedUsers[0].email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAfterFix();
