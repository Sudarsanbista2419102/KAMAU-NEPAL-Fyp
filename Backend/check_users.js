import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config({ path: './Backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email isVerified provider');
    console.log('--- ALL USERS ---');
    console.log(users);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
