import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmailConfig() {
  console.log("🧪 Testing Email Configuration...\n");

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Check if credentials are set
  if (!emailUser) {
    console.error("❌ EMAIL_USER is not set in .env file");
    process.exit(1);
  }

  if (!emailPass) {
    console.error("❌ EMAIL_PASS is not set in .env file");
    process.exit(1);
  }

  console.log(`✅ EMAIL_USER: ${emailUser}`);
  console.log(`✅ EMAIL_PASS: ${emailPass.substring(0, 3)}${"*".repeat(emailPass.length - 3)}`);
  console.log(`✅ Password length: ${emailPass.replace(/\s+/g, "").length} characters\n`);

  try {
    const cleanPass = emailPass.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    });

    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!\n");

    console.log("📧 Sending test email...");
    const info = await transporter.sendMail({
      from: `"Kamau Nepal Test" <${emailUser}>`,
      to: emailUser,
      subject: "Kamau Nepal - Email Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0d9488;">✅ Email Configuration is Working!</h2>
          <p>Your email setup is correctly configured and ready to send OTPs.</p>
          <p style="color: #666; font-size: 12px;">Test sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log(`✅ Test email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n🎉 Your email configuration is working correctly!`);
    console.log(`   OTPs will now be sent to users' email addresses.\n`);

  } catch (err) {
    console.error("❌ Email configuration test failed!\n");
    console.error(`Error: ${err.message}`);
    console.error(`Code: ${err.code}\n`);

    if (err.code === "EAUTH") {
      console.error("💡 Authentication Error - Possible causes:");
      console.error("   1. EMAIL_PASS is incorrect (should be 16-char App Password, not regular password)");
      console.error("   2. 2-Step Verification is not enabled on your Gmail account");
      console.error("   3. App Password was not generated correctly\n");
      console.error("📖 To fix:");
      console.error("   1. Go to https://myaccount.google.com/security");
      console.error("   2. Enable 2-Step Verification");
      console.error("   3. Generate an App Password for 'Mail' and 'Windows Computer'");
      console.error("   4. Copy the 16-character password to EMAIL_PASS in .env\n");
    } else if (err.code === "ESOCKET") {
      console.error("💡 Network Error - Check your internet connection");
    }

    process.exit(1);
  }
}

testEmailConfig();
