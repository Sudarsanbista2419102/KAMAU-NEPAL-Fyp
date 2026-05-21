import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kamau_nepal');
    console.log("Connected to MongoDB.");

    // Manually force index creation to see if it throws E11000
    try {
      await User.init();
      console.log("User indexes built successfully. No duplicates blocking the index.");
    } catch (indexErr) {
      console.error("Index creation error (likely E11000 duplicate key):", indexErr.message);
    }

    const users = await User.find({});
    console.log(`Total users found: ${users.length}`);
    const emailCounts = {};
    for (const u of users) {
      const e = u.email ? u.email.toLowerCase() : 'null';
      emailCounts[e] = (emailCounts[e] || 0) + 1;
    }
    const duplicates = Object.keys(emailCounts).filter(e => emailCounts[e] > 1);
    if (duplicates.length > 0) {
      console.log("Found duplicate emails:", duplicates);
    } else {
      console.log("No duplicate emails found.");
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error("Error:", e);
  }
}

checkDuplicates();
