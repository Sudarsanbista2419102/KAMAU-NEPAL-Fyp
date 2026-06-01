import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CategoryModel from './models/categoryModel.js';

dotenv.config({ path: './.env' });

async function checkCategoryImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = await CategoryModel.find();
    console.log('\n📋 All Categories in Database:');
    console.log('================================');
    
    categories.forEach((cat, index) => {
      console.log(`\n${index + 1}. ${cat.label} (${cat.value})`);
      console.log(`   Image: ${cat.image || 'NO IMAGE'}`);
      console.log(`   ID: ${cat._id}`);
    });

    console.log('\n================================');
    console.log(`Total Categories: ${categories.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkCategoryImages();
