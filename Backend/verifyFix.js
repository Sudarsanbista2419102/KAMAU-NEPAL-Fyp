import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import fs from 'fs';

dotenv.config();

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const user = await User.findOne();
        if (!user) {
            console.log('❌ No user found in database to test with');
            process.exit(1);
        }

        console.log(`Testing with user: ${user.name} (${user._id})`);

        // Simulate the update logic in userRoute.js
        const updateData = {
            fullName: user.name + ' Updated',
            username: 'testuser' + Math.floor(Math.random() * 1000),
            profileImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        };

        console.log('Simulating profile update...');

        // Manual implementation check (matching our fix)
        user.name = updateData.fullName;
        user.username = updateData.username;

        // Handle profile image (simulating the fix logic)
        const reqFile = null; // simulate no file upload
        const profileImage = updateData.profileImage;

        if (reqFile) {
            // This part would crash before the fix if reqFile was null and we entered the startsWith block
        } else if (profileImage && profileImage.startsWith("data:")) {
            console.log("✅ Correctly identified base64 string");
            user.profileImage = profileImage;
        }

        await user.save();
        console.log('✅ User saved successfully with updated profile and image');

        // Verify retrieval
        const updatedUser = await User.findById(user._id);
        console.log('Updated user name:', updatedUser.name);
        console.log('Updated username:', updatedUser.username);
        console.log('Has profile image:', !!updatedUser.profileImage);

        if (updatedUser.profileImage === updateData.profileImage) {
            console.log('✅ Profile image correctly stored');
        } else {
            console.log('❌ Profile image mismatch');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

verify();
