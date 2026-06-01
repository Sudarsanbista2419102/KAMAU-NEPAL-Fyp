import dotenv from 'dotenv';
import { sendOtpEmail } from './utils/sendOtp.js';

dotenv.config();

console.log("Email user:", process.env.EMAIL_USER);
console.log("Email pass:", process.env.EMAIL_PASS ? "Set" : "Not Set");

(async () => {
    try {
        console.log("Sending test email...");
        await sendOtpEmail('saugatbista456@gmail.com', '123456');
        console.log("Email sent successfully!");
    } catch (e) {
        console.error("Failed to send email:", e);
    }
})();
