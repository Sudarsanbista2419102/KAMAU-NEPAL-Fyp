import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOtpEmail = async (email, otp) => {
  try {
    const rawPass = process.env.EMAIL_PASS;
    const cleanPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPass, // use App Password (stripped of spaces)
      },
    });

    const mailOptions = {
      from: `"Kamau Nepal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Kamau Nepal - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0d9488; text-align: center;">Welcome to Kamau Nepal!</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Thank you for your request. Please use the following One-Time Password (OTP) to proceed.</p>
          <div style="margin: 20px auto; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #f97316; background: #fff7ed; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">If you did not request this code, please ignore this email securely.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${email}:`, err.message);
    console.log(`🔑 [DEV-FALLBACK] OTP for ${email} is: ${otp}`);
    
    // If in production, rethrow the error so that the API request fails strictly.
    // If in development (local), return false instead of throwing so testing isn't blocked.
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
    return false;
  }
};

