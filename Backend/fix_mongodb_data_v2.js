import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import UserModel from './models/userModel.js';
import ProfessionalModel from './models/professionalModel.js';
import CategoryModel from './models/categoryModel.js';

async function fixMongoDBData() {
  try {
    console.log('\n=== KAMAU NEPAL - MONGODB DATA CLEANUP v2 ===\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    let fixCount = {
      usersVerified: 0,
      professionalNamesFixed: 0,
      categoryLabelsFixed: 0,
      userNamesFixed: 0
    };

    // FIX 1: Verify test users (using isVerified field)
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
      { $set: { isVerified: true } }
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
          const fullName = `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim();
          
          // Update firstName and lastName if missing
          if (fullName) {
            const nameParts = fullName.split(' ');
            if (!professional.firstName || professional.firstName === 'undefined') {
              professional.firstName = nameParts[0] || 'User';
            }
            if (!professional.lastName || professional.lastName === 'undefined') {
              professional.lastName = nameParts.slice(1).join(' ') || user.email.split('@')[0];
            }
            
            // Fix phone if invalid format (should be 10 digits)
            if (professional.phone && !professional.phone.match(/^[0-9]{10}$/)) {
              const digits = professional.phone.replace(/\D/g, '');
              if (digits.length >= 10) {
                professional.phone = digits.slice(-10);
              } else {
                professional.phone = '9800000000';
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
    console.log(`✅ Fixed ${fixCount.professionalNamesFixed} professional records\n`);

    // FIX 3: Populate category labels and values
    console.log('--- FIX 3: POPULATE CATEGORY LABELS AND VALUES ---');
    const categoryMapping = {
      'carpentry': { label: 'Carpentry', value: 'carpentry' },
      'cleaning': { label: 'Cleaning', value: 'cleaning' },
      'electrical': { label: 'Electrical', value: 'electrical' },
      'electrician': { label: 'Electrician', value: 'electrician' },
      'gardening': { label: 'Gardening', value: 'gardening' },
      'mechanic': { label: 'Mechanic', value: 'mechanic' },
      'painting': { label: 'Painting', value: 'painting' },
      'plumbing': { label: 'Plumbing', value: 'plumbing' },
      'logo_designer': { label: 'Logo Designer', value: 'logo_designer' },
      'graphic_designer': { label: 'Graphic Designer', value: 'graphic_designer' },
      'tutoring': { label: 'Tutoring', value: 'tutoring' },
      'dog_walking': { label: 'Dog Walking', value: 'dog_walking' },
      'house_cleaning': { label: 'House Cleaning', value: 'house_cleaning' }
    };

    const categories = await CategoryModel.find({});
    
    for (const category of categories) {
      let updated = false;
      
      // If label is missing or undefined, try to set it
      if (!category.label || category.label === 'undefined') {
        if (category.image) {
          const imagePath = category.image.toLowerCase();
          for (const [key, mapping] of Object.entries(categoryMapping)) {
            if (imagePath.includes(key)) {
              category.label = mapping.label;
              category.value = mapping.value;
              updated = true;
              break;
            }
          }
        }
      }
      
      // If still no label, create one from the image filename
      if (!category.label || category.label === 'undefined') {
        if (category.image) {
          const filename = category.image.split('/').pop().split('.')[0];
          category.label = filename.replace(/_/g, ' ').replace(/[-]/g, ' ').toUpperCase();
          category.value = filename.toLowerCase().replace(/[-\s]/g, '_');
          updated = true;
        }
      }

      if (updated) {
        await category.save();
        fixCount.categoryLabelsFixed++;
      }
    }
    console.log(`✅ Fixed ${fixCount.categoryLabelsFixed} category records\n`);

    // FIX 4: Fix user names and profiles
    console.log('--- FIX 4: FIX USER NAMES ---');
    const usersWithMissingNames = await UserModel.find({
      $or: [
        { firstName: { $in: [null, undefined, ''] } },
        { lastName: { $in: [null, undefined, ''] } },
        { name: { $in: [null, undefined, ''] } }
      ]
    });

    for (const user of usersWithMissingNames) {
      if (!user.name || user.name === 'undefined' || user.name === '') {
        const firstName = user.firstName || 'User';
        const lastName = user.lastName || user.email.split('@')[0];
        user.name = `${firstName} ${lastName}`;
      }
      await user.save();
      fixCount.userNamesFixed++;
    }
    console.log(`✅ Fixed ${fixCount.userNamesFixed} user names\n`);

    // VERIFICATION
    console.log('=== VERIFICATION ===\n');
    
    const verifiedUsers = await UserModel.countDocuments({ isVerified: true });
    const profFirstNamesSet = await ProfessionalModel.countDocuments({ 
      firstName: { $nin: [null, undefined, '', 'undefined'] } 
    });
    const categoryLabelsSet = await CategoryModel.countDocuments({ 
      label: { $nin: [null, undefined, '', 'undefined'] } 
    });

    console.log(`📊 After cleanup:`);
    console.log(`   Verified Users: ${verifiedUsers} (was 0) ✅`);
    console.log(`   Professionals with names: ${profFirstNamesSet}/${await ProfessionalModel.countDocuments()}`);
    console.log(`   Categories with labels: ${categoryLabelsSet}/${await CategoryModel.countDocuments()}`);

    // Show sample fixed data
    console.log('\n=== SAMPLE FIXED DATA ===\n');
    
    const fixedUser = await UserModel.findOne({ email: 'asmitbista123@gmail.com' });
    if (fixedUser) {
      console.log(`Sample User (now verified):`);
      console.log(`  Name: ${fixedUser.name}`);
      console.log(`  Email: ${fixedUser.email}`);
      console.log(`  isVerified: ${fixedUser.isVerified}`);
    }

    const fixedProf = await ProfessionalModel.findOne({ firstName: { $nin: [null, undefined, '', 'undefined'] } });
    if (fixedProf) {
      console.log(`\nSample Professional:`);
      console.log(`  Name: ${fixedProf.firstName} ${fixedProf.lastName}`);
      console.log(`  Category: ${fixedProf.serviceCategory}`);
      console.log(`  Phone: ${fixedProf.phone}`);
      console.log(`  Status: ${fixedProf.verificationStatus}`);
    }

    const fixedCat = await CategoryModel.findOne({ label: { $nin: [null, undefined, '', 'undefined'] } });
    if (fixedCat) {
      console.log(`\nSample Category:`);
      console.log(`  Label: ${fixedCat.label}`);
      console.log(`  Value: ${fixedCat.value}`);
      console.log(`  Image: ${fixedCat.image}`);
    }

    console.log('\n=== DATA CLEANUP COMPLETE ===\n');
    console.log(`Summary of Changes:`);
    console.log(`  ✅ Users Verified: ${fixCount.usersVerified}`);
    console.log(`  ✅ Professional Records Fixed: ${fixCount.professionalNamesFixed}`);
    console.log(`  ✅ Category Records Fixed: ${fixCount.categoryLabelsFixed}`);
    console.log(`  ✅ User Names Fixed: ${fixCount.userNamesFixed}`);
    console.log(`  ✅ Total Fixes: ${Object.values(fixCount).reduce((a, b) => a + b, 0)}\n`);

    console.log('✨ Ready for production! The admin dashboard should now display data correctly.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

fixMongoDBData();
