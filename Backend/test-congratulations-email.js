import { sendCongratulationsEmail, sendRejectionEmail } from './utils/sendOtp.js';

console.log('🧪 Testing congratulations and rejection emails...');

const testEmail = 'saugatbista456@gmail.com';
const testName = 'John Doe';
const testCategory = 'Plumbing';
const testRejectionReason = 'Incomplete documentation provided. Please submit all required certificates and portfolio samples.';

async function testEmails() {
  try {
    console.log('\n1. Testing Congratulations Email...');
    const congratsResult = await sendCongratulationsEmail(testEmail, testName, testCategory);
    if (congratsResult) {
      console.log('✅ Congratulations email sent successfully!');
    } else {
      console.log('❌ Congratulations email failed, but logged to console');
    }

    console.log('\n2. Testing Rejection Email...');
    const rejectionResult = await sendRejectionEmail(testEmail, testName, testCategory, testRejectionReason);
    if (rejectionResult) {
      console.log('✅ Rejection email sent successfully!');
    } else {
      console.log('❌ Rejection email failed, but logged to console');
    }

  } catch (error) {
    console.error('❌ Error during email tests:', error.message);
  }
}

testEmails().then(() => {
  console.log('\n🎯 Email testing completed!');
  process.exit(0);
});