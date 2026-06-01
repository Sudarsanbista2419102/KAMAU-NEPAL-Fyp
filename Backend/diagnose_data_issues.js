import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import UserModel from './models/userModel.js';
import ProfessionalModel from './models/professionalModel.js';
import CategoryModel from './models/categoryModel.js';

async function diagnoseIssues() {
  try {
    console.log('\n=== KAMAU NEPAL - DATA QUALITY DIAGNOSIS ===\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // 1. Check User Data Quality
    console.log('--- USER DATA QUALITY CHECK ---');
    const usersWithMissingNames = await UserModel.find({
      $or: [
        { firstName: { $in: [null, undefined, ''] } },
        { lastName: { $in: [null, undefined, ''] } }
      ]
    });
    console.log(`Users with missing names: ${usersWithMissingNames.length}`);
    if (usersWithMissingNames.length > 0) {
      console.log(`Sample users:\n`);
      usersWithMissingNames.slice(0, 3).forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  FirstName: "${user.firstName}" | LastName: "${user.lastName}"`);
        console.log(`  Verified: ${user.verified}`);
        console.log();
      });
    }

    // 2. Check Professional Data Quality
    console.log('--- PROFESSIONAL DATA QUALITY CHECK ---');
    const professionalWithMissingNames = await ProfessionalModel.find({
      $or: [
        { name: { $in: [null, undefined, ''] } },
        { userId: { $in: [null, undefined] } }
      ]
    });
    console.log(`Professionals with missing names: ${professionalWithMissingNames.length}`);
    console.log(`Professionals with missing userId: ${await ProfessionalModel.countDocuments({ userId: { $in: [null, undefined] } })}`);

    // 3. Check Category Data Quality
    console.log('\n--- CATEGORY DATA QUALITY CHECK ---');
    const categoriesWithMissingNames = await CategoryModel.find({
      $or: [
        { name: { $in: [null, undefined, ''] } },
        { image: { $in: [null, undefined, ''] } }
      ]
    });
    console.log(`Categories with missing names: ${categoriesWithMissingNames.length}`);
    if (categoriesWithMissingNames.length > 0) {
      console.log(`Sample categories:\n`);
      categoriesWithMissingNames.slice(0, 3).forEach(cat => {
        console.log(`  Name: "${cat.name}"`);
        console.log(`  Image: "${cat.image}"`);
        console.log(`  _id: ${cat._id}`);
        console.log();
      });
    }

    // 4. Test API Response
    console.log('--- TESTING ADMIN API RESPONSE ---');
    const users = await UserModel.find({})
      .select('-password')
      .limit(5);
    
    console.log(`\nFirst 5 users as API would return them:\n`);
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const professional = await ProfessionalModel.findOne({ userId: user._id });
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verified: user.verified,
        isProfessional: !!professional,
        professionalStatus: professional?.verificationStatus || null,
        serviceCategory: professional?.serviceCategory || null
      };
    }));

    console.log(JSON.stringify(enrichedUsers, null, 2));

    // 5. Check Verified Users
    console.log('\n--- VERIFIED USERS CHECK ---');
    const verifiedUsers = await UserModel.find({ verified: true });
    console.log(`Total verified users: ${verifiedUsers.length}`);
    if (verifiedUsers.length > 0) {
      verifiedUsers.slice(0, 3).forEach(user => {
        console.log(`  ✅ ${user.firstName} ${user.lastName} (${user.email})`);
      });
    } else {
      console.log('  ❌ No verified users in database');
      console.log('  This might be why admin dashboard shows 0 users');
    }

    // 6. Check Verified Professionals
    console.log('\n--- VERIFIED PROFESSIONALS CHECK ---');
    const verifiedProfs = await ProfessionalModel.find({ verificationStatus: 'verified' });
    console.log(`Total verified professionals: ${verifiedProfs.length}`);
    if (verifiedProfs.length > 0) {
      verifiedProfs.slice(0, 3).forEach(prof => {
        console.log(`  ✅ ${prof.name || 'UNNAMED'} - ${prof.serviceCategory}`);
      });
    }

    // 7. Check if there's a disconnect
    console.log('\n--- USER-PROFESSIONAL LINKING CHECK ---');
    const allProfs = await ProfessionalModel.find({});
    const linkedUserIds = allProfs.map(p => p.userId?.toString()).filter(Boolean);
    const allUsers = await UserModel.find({});
    const linkedCount = linkedUserIds.length;
    const unlinkedCount = allUsers.length - linkedCount;
    
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Professionals with userId: ${linkedCount}`);
    console.log(`Users without professional profile: ${unlinkedCount}`);

    console.log('\n=== DIAGNOSIS COMPLETE ===\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseIssues();
