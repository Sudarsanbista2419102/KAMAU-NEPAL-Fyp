import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CategoryModel from './models/categoryModel.js';

dotenv.config({ path: './.env' });

const categoriesData = [
  { value: 'carpentry', label: 'Carpentry', image: 'assets/categories/carpentry.png' },
  { value: 'cleaning', label: 'Cleaning', image: 'assets/categories/cleaning.png' },
  { value: 'electrical', label: 'Electrical', image: 'assets/categories/electrical.png' },
  { value: 'electrician', label: 'Electrician', image: 'assets/categories/electrician.png' },
  { value: 'gardening', label: 'Gardening', image: 'assets/categories/gardening.png' },
  { value: 'mechanic', label: 'Mechanic', image: 'assets/categories/mechanic.png' },
  { value: 'painting', label: 'Painting', image: 'assets/categories/painting.png' },
  { value: 'plumbing', label: 'Plumbing', image: 'assets/categories/plumbing.png' },
  { value: 'graphic_designer', label: 'Graphic Designer', image: null },
  { value: 'logo_designer', label: 'Logo Designer', image: null },
  { value: 'tutoring', label: 'Tutoring', image: null }
];

async function populateCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await CategoryModel.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const result = await CategoryModel.insertMany(categoriesData);
    console.log(`✅ Successfully populated ${result.length} categories`);
    
    // Display all categories
    const allCategories = await CategoryModel.find();
    console.log('All categories in DB:', allCategories);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

populateCategories();
