// emailTest.js - simple script to test email sending
import { sendBookingConfirmation } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

(async () => {
  try {
    await sendBookingConfirmation({
      to: 'saugatbista456@gmail.com',
      professionalName: 'John Doe',
      bookingDate: new Date(),
      bookingTime: '10:00 AM - 11:00 AM',
      bookingId: 'TEST12345'
    });
    console.log('✅ Test email sent successfully');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
  }
})();
