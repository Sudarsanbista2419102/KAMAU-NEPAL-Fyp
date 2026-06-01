import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

import Professional from '../models/professionalModel.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';

async function syncProfessionalStats() {
    try {
        console.log('--- Starting Professional Stats Synchronization ---');
        
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const professionals = await Professional.find({});
        console.log(`Found ${professionals.length} professionals to synchronize.`);

        for (const pro of professionals) {
            console.log(`\nProcessing: ${pro.firstName} ${pro.lastName} (${pro._id})`);

            // 1. Count Completed Jobs
            const completedJobsCount = await Booking.countDocuments({
                professionalId: pro._id,
                status: 'Completed'
            });

            // 2. Calculate Ratings and Reviews
            const reviews = await Review.find({ professionalId: pro._id });
            const totalReviews = reviews.length;
            const avgRating = totalReviews > 0 
                ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews)
                : 0;

            console.log(`- Completed Jobs: ${completedJobsCount}`);
            console.log(`- Total Reviews: ${totalReviews}`);
            console.log(`- Avg Rating: ${avgRating.toFixed(1)}`);

            // 3. Update the Professional record
            await Professional.findByIdAndUpdate(pro._id, {
                completedJobs: completedJobsCount,
                totalReviews: totalReviews,
                rating: parseFloat(avgRating.toFixed(1))
            });

            console.log('✅ Synchronized successfully.');
        }

        console.log('\n--- Synchronization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during synchronization:', err);
        process.exit(1);
    }
}

syncProfessionalStats();
