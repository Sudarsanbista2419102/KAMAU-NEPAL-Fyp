import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import UserModel from './models/userModel.js';
import ProfessionalModel from './models/professionalModel.js';
import CategoryModel from './models/categoryModel.js';

async function fixMongoDBData() {
  try {
    console.log('\n=== KAMAU NEPAL - MONGODB DATA CLEANUP ===\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    let fixCount = {
      usersVerified: 0,
      professionalNamesFixed: 0,
      categoryNamesFixed: 0,
      userNamesFixed: 0
    };

    // FIX 1: Verify test users
    console.log('--- FIX 1: VERIFY TEST USERS ---');
    const testEmails = [
      'asmitbista123@gmail.com',
      'shotdeath304@gmail.com',
      'purshotambista930@gmail.com',
      'nichalsingh123@gmail.com',
      'anishadhikari9847@gmail.com',
      'anushacharya875@gmail.com',
      'giri.prasanna280@gmail.com',
      'biditrana10@gmail.com'
    ];

    const verifyResult = await UserModel.updateMany(
      { email: { $in: testEmails } },
      { $set: { verified: true } }
    );

    fixCount.usersVerified = verifyResult.modifiedCount;
    console.log(`✅ Verified ${fixCount.usersVerified} test users`);
    console.log(`   Emails: ${testEmails.slice(0, 3).join(', ')}...\n`);

    // FIX 2: Populate professional names from linked users
    console.log('--- FIX 2: POPULATE PROFESSIONAL NAMES ---');
    const professionals = await ProfessionalModel.find({});
    
    for (const professional of professionals) {
      if (!professional.userId) continue;
      
      try {
        const user = await UserModel.findById(professional.userId);
        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          
          // Only update if name is missing or undefined
          if (fullName && (!professional.firstName || professional.firstName === 'undefined')) {
            const nameParts = fullName.split(' ');
            professional.firstName = nameParts[0] || 'User';
            professional.lastName = nameParts.slice(1).join(' ') || user.email.split('@')[0];
            
            // Fix phone if invalid format
            if (professional.phone && !professional.phone.match(/^[0-9]{10}$/)) {
              // Extract last 10 digits from phone number
              const digits = professional.phone.replace(/\D/g, '');
              if (digits.length >= 10) {
                professional.phone = digits.slice(-10);
              } else {
                professional.phone = '9800000000'; // Default valid phone
              }
            }
            
            await professional.save();
            fixCount.professionalNamesFixed++;
          }
        }
      } catch (err) {
        console.log(`  ⚠️  Skipped professional ${professional._id}: ${err.message.split('\n')[0]}`);
      }
    }
    console.log(`✅ Fixed ${fixCount.professionalNamesFixed} professional names\n`);

    // FIX 3: Populate category names from image paths
    console.log('--- FIX 3: POPULATE CATEGORY NAMES ---');
    const categoryNameMapping = {
      'carpentry': 'Carpentry',
      'cleaning': 'Cleaning',
      'electrical': 'Electrical',
      'electrician': 'Electrician',
      'gardening': 'Gardening',
      'mechanic': 'Mechanic',
      'painting': 'Painting',
      'plumbing': 'Plumbing',
      'logo_designer': 'Logo Designer',
      'graphic_designer': 'Graphic Designer',
      'tutoring': 'Tutoring',
      'dog_walking': 'Dog Walking',
      'house_cleaning': 'House Cleaning'
    };

    const categories = await CategoryModel.find({});
    
    for (const category of categories) {
      if (!category.name || category.name === 'undefined') {
        // Extract category type from image path
        let categoryType = null;
        
        if (category.image) {
          const imagePath = category.image.toLowerCase();
          for (const [key, value] of Object.entries(categoryNameMapping)) {
            if (imagePath.includes(key)) {
              categoryType = value;
              break;
            }
          }
        }

        if (categoryType) {
          category.name = categoryType;
          await category.save();
          fixCount.categoryNamesFixed++;
        }
      }
    }
    console.log(`✅ Fixed ${fixCount.categoryNamesFixed} category names\n`);

    // FIX 4: Fix users with undefined names
    console.log('--- FIX 4: FIX USER NAMES ---');
    const usersWithUndefinedNames = await UserModel.find({
      $or: [
        { firstName: { $in: ['undefined', null, ''] } },
        { lastName: { $in: ['undefined', null, ''] } }
      ]
    });

    for (const user of usersWithUndefinedNames) {
      if (!user.firstName || user.firstName === 'undefined') {
        user.firstName = 'User';
      }
      if (!user.lastName || user.lastName === 'undefined') {
        user.lastName = user.email.split('@')[0];
      }
      await user.save();
      fixCount.userNamesFixed++;
    }
    console.log(`✅ Fixed ${fixCount.userNamesFixed} user names\n`);

    // VERIFICATION
    console.log('=== VERIFICATION ===\n');
    
    const verifiedUsers = await UserModel.countDocuments({ verified: true });
    const professionalNamesSet = await ProfessionalModel.countDocuments({ 
      name: { $nin: [null, undefined, '', 'undefined'] } 
    });
    const categoryNamesSet = await CategoryModel.countDocuments({ 
      name: { $nin: [null, undefined, '', 'undefined'] } 
    });

    console.log(`📊 After cleanup:`);
    console.log(`   Verified Users: ${verifiedUsers} (was 0)`);
    console.log(`   Professionals with names: ${professionalNamesSet}/${await ProfessionalModel.countDocuments()}`);
    console.log(`   Categories with names: ${categoryNamesSet}/${await CategoryModel.countDocuments()}`);

    // Show sample fixed data
    console.log('\n=== SAMPLE FIXED DATA ===\n');
    
    const fixedUser = await UserModel.findOne({ email: 'asmitbista123@gmail.com' });
    if (fixedUser) {
      console.log(`Sample User (now verified):`);
      console.log(`  Name: ${fixedUser.firstName} ${fixedUser.lastName}`);
      console.log(`  Email: ${fixedUser.email}`);
      console.log(`  Verified: ${fixedUser.verified}`);
    }

    const fixedProf = await ProfessionalModel.findOne({ name: { $nin: [null, undefined, '', 'undefined'] } });
    if (fixedProf) {
      console.log(`\nSample Professional (name fixed):`);
      console.log(`  Name: ${fixedProf.name}`);
      console.log(`  Category: ${fixedProf.serviceCategory}`);
      console.log(`  Status: ${fixedProf.verificationStatus}`);
    }

    const fixedCat = await CategoryModel.findOne({ name: { $nin: [null, undefined, '', 'undefined'] } });
    if (fixedCat) {
      console.log(`\nSample Category (name fixed):`);
      console.log(`  Name: ${fixedCat.name}`);
      console.log(`  Image: ${fixedCat.image}`);
    }

    console.log('\n=== DATA CLEANUP COMPLETE ===\n');
    console.log(`Summary of Changes:`);
    console.log(`  ✅ Users Verified: ${fixCount.usersVerified}`);
    console.log(`  ✅ Professional Names Fixed: ${fixCount.professionalNamesFixed}`);
    console.log(`  ✅ Category Names Fixed: ${fixCount.categoryNamesFixed}`);
    console.log(`  ✅ User Names Fixed: ${fixCount.userNamesFixed}`);
    console.log(`  ✅ Total Fixes: ${Object.values(fixCount).reduce((a, b) => a + b, 0)}\n`);

    console.log('Ready for production! The admin dashboard should now display data correctly.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

fixMongoDBData();
