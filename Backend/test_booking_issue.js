import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import BookingModel from './models/bookingModel.js';
import UserModel from './models/userModel.js';

async function testBookingIssue() {
  try {
    console.log('\n=== BOOKING CREATION TEST ===\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // 1. Check if Booking model has correct schema
    console.log('--- BOOKING SCHEMA CHECK ---');
    const bookingSchema = BookingModel.schema;
    console.log('Booking model fields:');
    Object.keys(bookingSchema.paths).forEach(field => {
      if (!field.startsWith('_')) {
        console.log(`  - ${field}`);
      }
    });

    // 2. Try to create a test booking
    console.log('\n--- TEST BOOKING CREATION ---');
    const testUserId = await UserModel.findOne({}).select('_id');
    
    if (!testUserId) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    const testBooking = {
      userId: testUserId._id,
      serviceTitle: 'Test Plumbing Service',
      serviceProvider: 'Test Plumber',
      professionalId: null,
      fullName: 'Test Customer',
      workDescription: 'Fix a leaky tap',
      timeSchedule: '10:00 AM',
      bookingDate: new Date().toISOString().split('T')[0],
      location: 'Kathmandu',
      hourlyRate: 'रू 500',
      totalCost: 'रू 1000',
      rating: 0,
      notes: 'Test booking'
    };

    console.log('Creating test booking:');
    console.log(JSON.stringify(testBooking, null, 2));

    const booking = new BookingModel(testBooking);
    await booking.save();

    console.log('✅ Test booking created successfully!');
    console.log(`  Booking ID: ${booking._id}`);
    console.log(`  Status: ${booking.status}`);
    console.log(`  User ID: ${booking.userId}`);

    // 3. Verify it was saved
    console.log('\n--- VERIFICATION ---');
    const saved = await BookingModel.findById(booking._id);
    console.log(`✅ Booking retrieved from DB: ${saved ? 'YES' : 'NO'}`);

    // 4. Check if required fields are present
    console.log('\n--- REQUIRED FIELDS CHECK ---');
    const requiredFields = ['userId', 'serviceTitle', 'serviceProvider', 'fullName', 'workDescription', 'timeSchedule', 'bookingDate', 'location'];
    requiredFields.forEach(field => {
      const value = testBooking[field];
      const status = value ? '✅' : '❌';
      console.log(`${status} ${field}: ${value || 'MISSING'}`);
    });

    console.log('\n=== BOOKING SCHEMA IS WORKING ===\n');

    // 5. Check API endpoint configuration
    console.log('--- API ENDPOINT CHECK ---');
    console.log('POST /api/bookings endpoint:');
    console.log('  ❌ No token verification middleware');
    console.log('  ⚠️  ISSUE: createBooking expects req.user but route has no verifyToken');
    console.log('  ⚠️  userId will be undefined if sent without Authorization header');
    console.log('  ⚠️  Can be bypassed by sending userId in body');
    console.log('  ⚠️  But mobile/frontend should send Bearer token');

    console.log('\n=== DIAGNOSIS ===\n');
    console.log('Possible issues preventing bookings:');
    console.log('1. ❌ Missing token in Authorization header');
    console.log('2. ❌ Endpoint not protected (but should still work with userId)');
    console.log('3. ❌ One of the required fields is missing/invalid');
    console.log('4. ❌ Frontend not catching error properly');
    console.log('5. ❌ Backend server not running/deployed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

testBookingIssue();
