import mongoose from 'mongoose';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Professional from '../models/professionalModel.js';

dotenv.config();

const uploadsDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Migrate Users
    const users = await User.find({ profileImage: { $regex: /^data:image/ } });
    console.log(`Found ${users.length} users with base64 images`);

    for (const user of users) {
      try {
        const base64Data = user.profileImage.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `opt-profile-user-${user._id}-${Date.now()}.webp`;
        const optimizedPath = path.join(uploadsDir, filename);
        
        await sharp(buffer)
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        user.profileImage = `uploads/${filename}`;
        await user.save();
        console.log(`✅ Migrated User: ${user.email} -> ${user.profileImage}`);
      } catch (err) {
        console.error(`❌ Failed to migrate user ${user.email}:`, err.message);
      }
    }

    // 2. Migrate Professionals (Profile Images)
    const professionals = await Professional.find({ profileImage: { $regex: /^data:image/ } });
    console.log(`Found ${professionals.length} professionals with base64 profile images`);

    for (const pro of professionals) {
      try {
        const base64Data = pro.profileImage.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `opt-profile-pro-${pro._id}-${Date.now()}.webp`;
        const optimizedPath = path.join(uploadsDir, filename);
        
        await sharp(buffer)
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        pro.profileImage = `uploads/${filename}`;
        await pro.save();
        console.log(`✅ Migrated Professional Profile: ${pro.email} -> ${pro.profileImage}`);
      } catch (err) {
        console.error(`❌ Failed to migrate professional ${pro.email}:`, err.message);
      }
    }

    // 3. Migrate Professionals (Cover Images)
    const prosWithCovers = await Professional.find({ coverImage: { $regex: /^data:image/ } });
    console.log(`Found ${prosWithCovers.length} professionals with base64 cover images`);

    for (const pro of prosWithCovers) {
      try {
        const base64Data = pro.coverImage.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `opt-cover-pro-${pro._id}-${Date.now()}.webp`;
        const optimizedPath = path.join(uploadsDir, filename);
        
        await sharp(buffer)
          .resize(1200, 400, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        pro.coverImage = `uploads/${filename}`;
        await pro.save();
        console.log(`✅ Migrated Professional Cover: ${pro.email} -> ${pro.coverImage}`);
      } catch (err) {
        console.error(`❌ Failed to migrate professional cover ${pro.email}:`, err.message);
      }
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
