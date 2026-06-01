import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Create reusable transporter using SMTP configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a booking confirmation email.
 * @param {Object} params
 * @param {string} params.to - Recipient email address.
 * @param {string} params.professionalName - Name of the professional providing the service.
 * @param {string|Date} params.bookingDate - Date of the appointment.
 * @param {string} params.bookingTime - Time slot of the appointment.
 * @param {string} params.bookingId - Booking reference ID.
 */
export const sendBookingConfirmation = async ({ to, professionalName, bookingDate, bookingTime, bookingId }) => {
  const formattedDate = new Date(bookingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;">
      <h2 style="color:#ff6600;">Your Booking is Confirmed!</h2>
      <p>Hi,</p>
      <p>We’re delighted to confirm your appointment with <strong>${professionalName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr>
          <td style="padding:8px;border:1px solid #e0e0e0;">Date</td>
          <td style="padding:8px;border:1px solid #e0e0e0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e0e0e0;">Time</td>
          <td style="padding:8px;border:1px solid #e0e0e0;">${bookingTime}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e0e0e0;">Reference</td>
          <td style="padding:8px;border:1px solid #e0e0e0;">${bookingId}</td>
        </tr>
      </table>
      <p>If you need to modify or cancel, visit <a href="${process.env.APP_URL || ''}/my-bookings">My Bookings</a>.</p>
      <p>Thank you for choosing KAMAU Nepal!</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} KAMAU Nepal. All rights reserved.</p>
    </div>
  `;

  const mailOptions = {
    from: `"KAMAU Nepal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Booking Confirmation – KAMAU Nepal',
    html,
  };

  await transporter.sendMail(mailOptions);
};
