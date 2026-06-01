import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import UserModel from './models/userModel.js';
import ProfessionalModel from './models/professionalModel.js';
import BookingModel from './models/bookingModel.js';
import CategoryModel from './models/categoryModel.js';
import AdminModel from './models/adminModel.js';

async function fetchMongoData() {
  try {
    console.log('\n=== KAMAU NEPAL - MONGODB DATA FETCH ===\n');
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!\n');

    // 1. Fetch Users
    console.log('--- USERS DATA ---');
    const users = await UserModel.find({}).select('-password').limit(10);
    console.log(`Total Users: ${await UserModel.countDocuments()}`);
    if (users.length > 0) {
      console.log(`Fetched ${users.length} users (showing first 10):\n`);
      users.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
        console.log(`   Verified: ${user.verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.createdAt}\n`);
      });
    } else {
      console.log('❌ No users found\n');
    }

    // 2. Fetch Professionals
    console.log('--- PROFESSIONALS DATA ---');
    const professionals = await ProfessionalModel.find({}).limit(10);
    console.log(`Total Professionals: ${await ProfessionalModel.countDocuments()}`);
    if (professionals.length > 0) {
      console.log(`Fetched ${professionals.length} professionals (showing first 10):\n`);
      professionals.forEach((prof, idx) => {
        console.log(`${idx + 1}. ${prof.name}`);
        console.log(`   Category: ${prof.serviceCategory}`);
        console.log(`   Status: ${prof.verificationStatus}`);
        console.log(`   Hourly Rate: ${prof.hourlyRate || 'N/A'}`);
        console.log(`   Created: ${prof.createdAt}\n`);
      });
    } else {
      console.log('❌ No professionals found\n');
    }

    // 3. Fetch Bookings
    console.log('--- BOOKINGS DATA ---');
    const bookings = await BookingModel.find({}).limit(10);
    console.log(`Total Bookings: ${await BookingModel.countDocuments()}`);
    if (bookings.length > 0) {
      console.log(`Fetched ${bookings.length} bookings (showing first 10):\n`);
      bookings.forEach((booking, idx) => {
        console.log(`${idx + 1}. ${booking.serviceTitle}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment: ${booking.paymentStatus}`);
        console.log(`   Total Cost: ${booking.totalCost}`);
        console.log(`   Created: ${booking.createdAt}\n`);
      });
    } else {
      console.log('❌ No bookings found\n');
    }

    // 4. Fetch Categories
    console.log('--- CATEGORIES DATA ---');
    const categories = await CategoryModel.find({});
    console.log(`Total Categories: ${categories.length}`);
    if (categories.length > 0) {
      console.log(`Categories:\n`);
      categories.forEach((cat, idx) => {
        console.log(`${idx + 1}. ${cat.name}`);
        console.log(`   Image: ${cat.image || 'No image'}`);
        console.log(`   Professionals: ${cat.professionalCount || 0}\n`);
      });
    } else {
      console.log('❌ No categories found\n');
    }

    // 5. Fetch Admins
    console.log('--- ADMIN DATA ---');
    const admins = await AdminModel.find({});
    console.log(`Total Admins: ${admins.length}`);
    if (admins.length > 0) {
      console.log(`Admins:\n`);
      admins.forEach((admin, idx) => {
        console.log(`${idx + 1}. ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}\n`);
      });
    } else {
      console.log('❌ No admins found\n');
    }

    // 6. Summary Statistics
    console.log('=== SUMMARY STATISTICS ===\n');
    const stats = {
      totalUsers: await UserModel.countDocuments(),
      verifiedUsers: await UserModel.countDocuments({ verified: true }),
      totalProfessionals: await ProfessionalModel.countDocuments(),
      verifiedProfessionals: await ProfessionalModel.countDocuments({ verificationStatus: 'verified' }),
      totalBookings: await BookingModel.countDocuments(),
      completedBookings: await BookingModel.countDocuments({ status: 'completed' }),
      paidBookings: await BookingModel.countDocuments({ paymentStatus: 'Paid' }),
      totalCategories: await CategoryModel.countDocuments(),
      totalAdmins: await AdminModel.countDocuments()
    };

    console.log(`📊 Platform Statistics:`);
    console.log(`   Total Users: ${stats.totalUsers}`);
    console.log(`   Verified Users: ${stats.verifiedUsers}`);
    console.log(`   Total Professionals: ${stats.totalProfessionals}`);
    console.log(`   Verified Professionals: ${stats.verifiedProfessionals}`);
    console.log(`   Total Bookings: ${stats.totalBookings}`);
    console.log(`   Completed Bookings: ${stats.completedBookings}`);
    console.log(`   Paid Bookings: ${stats.paidBookings}`);
    console.log(`   Total Categories: ${stats.totalCategories}`);
    console.log(`   Total Admins: ${stats.totalAdmins}\n`);

    // 7. Test User-Professional Connection
    console.log('=== TESTING USER-PROFESSIONAL CONNECTION ===\n');
    const userWithProf = await UserModel.findOne({ verified: true });
    if (userWithProf) {
      console.log(`Testing with User: ${userWithProf.firstName} ${userWithProf.lastName}`);
      const linkedProf = await ProfessionalModel.findOne({ userId: userWithProf._id });
      if (linkedProf) {
        console.log(`✅ Found linked professional: ${linkedProf.name}`);
        console.log(`   Category: ${linkedProf.serviceCategory}`);
        console.log(`   Status: ${linkedProf.verificationStatus}\n`);
      } else {
        console.log(`❌ No professional record linked to this user\n`);
      }
    }

    console.log('=== DATA FETCH COMPLETE ===\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
fetchMongoData();
