import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkDeployment() {
  console.log('\n=== DEPLOYMENT CONNECTIVITY CHECK ===\n');

  // 1. Check environment variables
  console.log('--- ENVIRONMENT VARIABLES ---');
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'FRONTEND_URL',
    'BACKEND_BASE_URL',
    'CLIENT_BASE_URL',
    'NODE_ENV',
    'PORT'
  ];

  const missing = [];
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Show masked version for sensitive data
      const display = varName.includes('SECRET') || varName.includes('URI') 
        ? value.substring(0, 20) + '...' 
        : value;
      console.log(`✅ ${varName}: ${display}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing ${missing.length} environment variables`);
  }

  // 2. Check MongoDB connection
  console.log('\n--- MONGODB CONNECTION ---');
  try {
    if (!process.env.MONGO_URI) {
      console.log('❌ MONGO_URI not set - cannot connect');
    } else {
      console.log('Attempting MongoDB connection...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected successfully');
      
      // Test data
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`✅ Database has ${collections.length} collections:`);
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      await mongoose.connection.close();
    }
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
  }

  // 3. Check URL configuration
  console.log('\n--- URL CONFIGURATION ---');
  console.log('Frontend URL:', process.env.FRONTEND_URL || '❌ NOT SET');
  console.log('Backend URL:', process.env.BACKEND_BASE_URL || '❌ NOT SET');
  console.log('Port:', process.env.PORT || '❌ NOT SET');

  // 4. CORS Configuration
  console.log('\n--- CORS WHITELIST ---');
  const corsOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ];
  console.log('CORS will accept requests from:');
  corsOrigins.forEach(origin => {
    console.log(`  - ${origin}`);
  });

  // 5. Expected Frontend URL
  console.log('\n--- EXPECTED FRONTEND URL ---');
  if (process.env.FRONTEND_URL === 'https://kamau-nepal-fyp.vercel.app') {
    console.log('✅ FRONTEND_URL is correctly set to production Frontend');
  } else {
    console.log(`⚠️  FRONTEND_URL might be wrong: ${process.env.FRONTEND_URL}`);
    console.log('   Should be: https://kamau-nepal-fyp.vercel.app');
  }

  // 6. Expected Backend URL
  console.log('\n--- EXPECTED BACKEND URL ---');
  if (process.env.BACKEND_BASE_URL === 'https://kamau-nepal-fyp.onrender.com') {
    console.log('✅ BACKEND_BASE_URL is correctly set');
  } else {
    console.log(`⚠️  BACKEND_BASE_URL might be wrong: ${process.env.BACKEND_BASE_URL}`);
    console.log('   Should be: https://kamau-nepal-fyp.onrender.com');
  }

  // 7. Production Status
  console.log('\n--- PRODUCTION STATUS ---');
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ NODE_ENV is set to production');
  } else {
    console.log(`⚠️  NODE_ENV is: ${process.env.NODE_ENV} (should be "production")`);
  }

  console.log('\n=== CHECK COMPLETE ===\n');
  console.log('Next Steps:');
  console.log('1. If MongoDB failed: Check connection string in Render env');
  console.log('2. If URLs are wrong: Update in Render dashboard');
  console.log('3. If all ✅: Try redeploying from Render dashboard');
  console.log('4. Check Frontend browser console (F12) for API call errors\n');

  process.exit(0);
}

checkDeployment().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
