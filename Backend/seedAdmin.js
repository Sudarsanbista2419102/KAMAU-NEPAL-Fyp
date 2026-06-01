/**
 * Admin Seeder
 * Run this script to create a default admin account
 * 
 * Usage: node seedAdmin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminModel from './models/adminModel.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kamau_nepal');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('Admin already exists. Exiting...');
      await mongoose.connection.close();
      return;
    }

    // Create default admin
    const admin = new AdminModel({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed before saving
      fullName: 'System Administrator',
      role: 'super_admin',
      permissions: [
        'view_dashboard',
        'manage_professionals',
        'verify_applications',
        'reject_applications',
        'view_analytics',
        'export_data',
        'manage_admins'
      ],
      isActive: true
    });

    await admin.save();
    console.log('✅ Default admin created successfully!');
    console.log('Username: admin');
    console.log(`Email: ${admin.email}`);
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password immediately in production!');

    await mongoose.connection.close();
    console.log('Connection closed');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
