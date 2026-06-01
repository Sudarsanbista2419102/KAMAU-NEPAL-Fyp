import { sendCongratulationsEmail } from './utils/sendOtp.js';

console.log('🧪 Quick email test starting...');

try {
  const result = await sendCongratulationsEmail(
    'saugatbista456@gmail.com',
    'Test Professional',
    'Plumbing'
  );
  
  if (result) {
    console.log('✅ SUCCESS: Congratulations email sent!');
  } else {
    console.log('⚠️ Email failed but logged to console (this is expected in dev mode)');
  }
} catch (error) {
  console.error('❌ ERROR:', error.message);
}

console.log('🎯 Test completed!');
process.exit(0);