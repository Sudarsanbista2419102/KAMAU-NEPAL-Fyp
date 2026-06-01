import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOtpEmail = async (email, otp) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Validate email credentials are configured
    if (!emailUser || !emailPass) {
      console.warn("⚠️ Email credentials not configured in .env file");
      console.log(`🔑 [DEV-FALLBACK] OTP for ${email} is: ${otp}`);
      return false;
    }

    // Clean up the password (remove spaces)
    const cleanPass = emailPass.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: cleanPass, // Gmail App Password (16 characters, no spaces)
      },
      // Add these options for better reliability
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 5,
    });

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: `"Kamau Nepal" <${emailUser}>`,
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${email}:`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    
    // Log helpful debugging information
    if (err.code === "EAUTH") {
      console.error("   ⚠️ Authentication failed. Check EMAIL_USER and EMAIL_PASS in .env");
      console.error("   💡 Make sure you're using a Gmail App Password (16 chars), not your regular password");
    } else if (err.code === "ESOCKET") {
      console.error("   ⚠️ Network error. Check your internet connection");
    }
    
    console.log(`\n🔑 [DEV-FALLBACK] OTP for ${email} is: ${otp}`);
    
    // Return false on any failure
    return false;
  }
};

export const sendCongratulationsEmail = async (email, professionalName, serviceCategory) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Validate email credentials are configured
    if (!emailUser || !emailPass) {
      console.warn("⚠️ Email credentials not configured in .env file");
      console.log(`🎉 [DEV-FALLBACK] Congratulations email for ${email} - Professional request approved!`);
      return false;
    }

    // Clean up the password (remove spaces)
    const cleanPass = emailPass.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 5,
    });

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: `"Kamau Nepal" <${emailUser}>`,
      to: email,
      subject: "🎉 Congratulations! Your Professional Request has been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(5,150,105,0.1);">🎉 Congratulations!</h1>
            <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #10b981, #059669); margin: 15px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 25px;">
            <h2 style="color: #0d9488; margin-top: 0; font-size: 22px;">Your Professional Request has been Approved! ✅</h2>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              Dear <strong style="color: #059669;">${professionalName}</strong>,
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              We're excited to inform you that your professional application for <strong style="color: #0d9488;">${serviceCategory}</strong> has been successfully approved!
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              You are now officially verified as a professional service provider on Kamau Nepal platform.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 25px;">
            <h3 style="color: #059669; margin-top: 0; font-size: 18px;">🚀 What's Next?</h3>
            <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Access your Professional Dashboard to manage service requests</li>
              <li style="margin-bottom: 8px;">Update your profile with additional details and portfolio</li>
              <li style="margin-bottom: 8px;">Start receiving and responding to customer bookings</li>
              <li style="margin-bottom: 8px;">Build your reputation through excellent service delivery</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_BASE_URL}/professional/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); transition: all 0.3s ease;">
              🎯 Access Professional Dashboard
            </a>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
              💡 <strong>Pro Tip:</strong> Complete your profile with high-quality photos and detailed service descriptions to attract more customers!
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
              Welcome to the Kamau Nepal professional community! 🤝
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              If you have any questions, feel free to contact our support team.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              © ${new Date().getFullYear()} Kamau Nepal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`🎉 Congratulations email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send congratulations email to ${email}:`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    
    console.log(`\n🎉 [DEV-FALLBACK] Congratulations email for ${email} - Professional request approved!`);
    
    return false;
  }
};

export const sendRejectionEmail = async (email, professionalName, serviceCategory, rejectionReason) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Validate email credentials are configured
    if (!emailUser || !emailPass) {
      console.warn("⚠️ Email credentials not configured in .env file");
      console.log(`📧 [DEV-FALLBACK] Rejection email for ${email} - Professional request rejected`);
      return false;
    }

    // Clean up the password (remove spaces)
    const cleanPass = emailPass.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 5,
    });

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: `"Kamau Nepal" <${emailUser}>`,
      to: email,
      subject: "📋 Update on Your Professional Application - Kamau Nepal",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; font-size: 24px; margin: 0;">📋 Application Update</h1>
            <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #ef4444, #dc2626); margin: 15px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 25px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">Professional Application Status</h2>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              Dear <strong style="color: #dc2626;">${professionalName}</strong>,
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              Thank you for your interest in becoming a professional service provider for <strong>${serviceCategory}</strong> on Kamau Nepal.
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 15px 0;">
              After careful review, we regret to inform you that your application could not be approved at this time.
            </p>
          </div>

          ${rejectionReason ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">📝 Feedback:</h3>
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
              ${rejectionReason}
            </p>
          </div>
          ` : ''}

          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #0ea5e9; margin-bottom: 25px;">
            <h3 style="color: #0369a1; margin-top: 0; font-size: 18px;">🔄 Next Steps</h3>
            <ul style="color: #0369a1; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Review the feedback provided above</li>
              <li style="margin-bottom: 8px;">Address any concerns mentioned in the feedback</li>
              <li style="margin-bottom: 8px;">You may reapply after making necessary improvements</li>
              <li style="margin-bottom: 8px;">Contact our support team if you need clarification</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_BASE_URL}/professional/apply" 
               style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0369a1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(14,165,233,0.3);">
              🔄 Apply Again
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
              We appreciate your interest in joining Kamau Nepal! 🙏
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              If you have any questions, feel free to contact our support team.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              © ${new Date().getFullYear()} Kamau Nepal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send rejection email to ${email}:`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    
    console.log(`\n📧 [DEV-FALLBACK] Rejection email for ${email} - Professional request rejected`);
    
    return false;
  }
};