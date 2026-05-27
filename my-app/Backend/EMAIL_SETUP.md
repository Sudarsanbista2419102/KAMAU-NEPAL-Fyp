# Email Configuration Guide for Kamau Nepal

## Overview
The application uses Gmail's SMTP service to send OTP (One-Time Password) emails for password reset and account verification. This guide will help you set up email delivery.

## Prerequisites
- A Gmail account
- 2-Step Verification enabled on your Gmail account

## Step-by-Step Setup

### 1. Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification" in the left sidebar
3. Follow the prompts to enable 2-Step Verification
4. You'll need to verify your phone number

### 2. Generate Gmail App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to find "App passwords" (only visible if 2-Step Verification is enabled)
3. Select "Mail" from the first dropdown
4. Select "Windows Computer" (or your device type) from the second dropdown
5. Click "Generate"
6. Google will show you a 16-character password
7. **Copy this password** (it includes spaces, which will be automatically removed)

### 3. Update .env File
1. Open `my-app/Backend/.env`
2. Find or add these lines:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```
3. Replace `your-email@gmail.com` with your Gmail address
4. Replace `xxxx xxxx xxxx xxxx` with the 16-character App Password you generated
5. Save the file

### 4. Test Email Configuration
Run the test script to verify your setup:
```bash
cd my-app/Backend
node test-email-config.js
```

Expected output:
```
✅ EMAIL_USER: your-email@gmail.com
✅ EMAIL_PASS: xxx***
✅ Password length: 16 characters

🔍 Verifying SMTP connection...
✅ SMTP connection verified successfully!

📧 Sending test email...
✅ Test email sent successfully!
   Message ID: <message-id>

🎉 Your email configuration is working correctly!
   OTPs will now be sent to users' email addresses.
```

## Troubleshooting

### Error: "Authentication failed"
**Cause:** Incorrect email credentials
**Solution:**
1. Verify you're using a Gmail App Password (16 characters), NOT your regular Gmail password
2. Make sure 2-Step Verification is enabled
3. Check that EMAIL_USER and EMAIL_PASS are correctly set in .env

### Error: "Network error"
**Cause:** Internet connection issue or Gmail SMTP server unreachable
**Solution:**
1. Check your internet connection
2. Try again after a few minutes
3. Verify Gmail SMTP is not blocked by your firewall

### OTP appears in console but not in email
**Cause:** Email delivery failed (common in development)
**Solution:**
1. Check the backend console for error messages
2. Run `node test-email-config.js` to diagnose the issue
3. For development, OTPs are logged to the console as a fallback

## Development Fallback
If email delivery fails, the OTP will be:
1. Logged to the backend console
2. Shown in the browser console warning
3. Available in the database for manual testing

This allows development to continue even if email is not configured.

## Production Considerations
- Use environment variables for sensitive credentials
- Consider using a dedicated email service (SendGrid, Mailgun, etc.) for production
- Monitor email delivery rates and bounce rates
- Implement email templates for better branding
- Add email verification for new accounts

## Alternative Email Providers
If you want to use a different email provider instead of Gmail:

### SendGrid
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  }
});
```

## Support
If you encounter issues:
1. Check the error message in the backend console
2. Run the test script: `node test-email-config.js`
3. Verify your Gmail App Password is correct
4. Check that 2-Step Verification is enabled
5. Review this guide for any missed steps
