import mongoose from 'mongoose';
import CategoryModel from './models/categoryModel.js';

const defaultCategories = [
  { value: "plumbing", label: "🔧 Plumbing" },
  { value: "electrical", label: "⚡ Electrical" },
  { value: "carpentry", label: "🪵 Carpentry" },
  { value: "cleaning", label: "🧹 Cleaning" },
  { value: "painting", label: "🎨 Painting" },
  { value: "gardening", label: "🌿 Gardening" },
  { value: "mechanic", label: "🔩 Mechanic" },
  { value: "tutoring", label: "📚 Tutoring" },
  { value: "freelancer", label: "💻 Freelancer" },
  { value: "graphic_designer", label: "🎨 Graphic Designer" },
  { value: "logo_designer", label: "✨ Logo Designer" },
  { value: "developer", label: "⌨️ Developer" },
  { value: "waiter", label: "🤵 Waiter" }
];

async function seedCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kamau_nepal');
    console.log('Connected to MongoDB');

    let addedCount = 0;
    for (const cat of defaultCategories) {
      const exists = await CategoryModel.findOne({ value: cat.value });
      if (!exists) {
        await CategoryModel.create(cat);
        addedCount++;
        console.log(`Added category: ${cat.label}`);
      }
    }
    
    console.log(`Seeding complete. Added ${addedCount} missing default categories.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
