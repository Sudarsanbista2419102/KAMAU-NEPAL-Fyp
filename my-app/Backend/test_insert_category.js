import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CategoryModel from './models/categoryModel.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');
    const cat = await CategoryModel.create({
      value: 'test_category_' + Date.now(),
      label: '🧪 Test Category',
    });
    console.log('🟢 Inserted:', cat);
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

run();
