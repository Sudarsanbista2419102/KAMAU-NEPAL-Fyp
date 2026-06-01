import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "./models/userModel.js";
import AdminModel from "./models/adminModel.js";
import ProfessionalModel from "./models/professionalModel.js";
import { sendOtpEmail } from "./utils/sendOtp.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { updateLocation, getNearbyProfessionals } from "./controllers/locationController.js";
import { verifyToken } from "./authMiddleware.js";
import sharp from "sharp";

const router = express.Router();

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables. Using fallback (not secure for production).");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

// Password validation helper
const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-]/.test(password);
  return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

// Ensure uploads directory exists
const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB
    fieldSize: 50 * 1024 * 1024  // 50MB for base64 strings/fields
  } 
});

/* =========================
   TEST
========================= */
router.get("/", (req, res) => {
  res.send("User route working");
});

/* =========================
   SIGNUP + SEND OTP
========================= */
router.post("/signup", async (req, res) => {
  try {
    let { name, firstName, lastName, email, password, address } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    email = email.toLowerCase().trim();

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password does not meet the security requirements." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      name,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    const isSent = await sendOtpEmail(email, otp);

    console.log("OTP SENT:", otp); // dev only

    if (isSent) {
      res.status(201).json({
        message: "Signup successful. OTP sent to email.",
        userId: user._id,
      });
    } else {
      res.status(201).json({
        message: "Signup successful. OTP generated. (Email delivery failed, check backend console logs for OTP)",
        userId: user._id,
        emailFailed: true
      });
    }

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   VERIFY OTP
========================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if OTP is empty or null
    if (!user.otp) {
      return res.status(400).json({ message: "No OTP found. Please sign up again or resend OTP." });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log("User verified and saved:", user._id);

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      isVerified: true,
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   RESEND OTP
========================= */
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newOtp = crypto.randomInt(100000, 999999).toString();

    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const isSent = await sendOtpEmail(user.email, newOtp);

    console.log("OTP RESENT:", newOtp); // dev only

    if (isSent) {
      res.json({ message: "New OTP sent to your email" });
    } else {
      res.json({ 
        message: "New OTP generated. (Email delivery failed, check backend console logs for OTP)",
        emailFailed: true
      });
    }

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "No account found with that email address" });

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const isSent = await sendOtpEmail(user.email, otp);
    console.log("PASSWORD RESET OTP SENT:", otp); // dev only

    if (isSent) {
      res.json({ message: "Password reset OTP sent to your email", userId: user._id });
    } else {
      res.json({ 
        message: "Password reset OTP generated. (Email delivery failed, check backend console logs for OTP)", 
        userId: user._id,
        emailFailed: true 
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: "Password does not meet the security requirements." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password has been successfully reset" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    email = email.toLowerCase().trim();

    // First, check if it's a regular user
    let user = await User.findOne({ email });
    let role = "user";

    if (!user) {
      // If no user found, check if it's an admin (search by email or username)
      const admin = await AdminModel.findOne({
        $or: [{ email }, { username: email }],
        isActive: true
      });

      if (admin) {
        // Compare password for admin using bcryptjs
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
          {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions
          },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.json({
          message: "Admin login successful",
          token,
          userId: admin._id,
          name: admin.fullName,
          role: "admin",
          verified: true,
          data: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            permissions: admin.permissions
          }
        });
      }

      return res.status(404).json({ message: "User not found" });
    }

    // Regular user verification
    if (!user.isVerified) {
      return res.status(401).json({ message: "Username does not exist or is not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Check if this user is a verified professional
    const professional = await ProfessionalModel.findOne({ 
      $or: [{ email: user.email }, { userId: user._id }], 
      verificationStatus: "verified" 
    });
    
    const token = jwt.sign(
      { id: user._id, role: professional ? "professional" : "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      role: professional ? "professional" : "user",
      verified: user.isVerified
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   GOOGLE LOGIN / SIGNUP
========================= */
router.post("/google-login", async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Fetch user info from Google using the access token
    const googleUserRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
    const { email: rawEmail, name, picture, sub: googleId } = googleUserRes.data;
    
    if (!rawEmail) {
      return res.status(400).json({ message: "Google account does not have an email associated with it." });
    }
    
    const email = rawEmail.toLowerCase().trim();

    // Check if user already exists (case-insensitive for legacy mixed-case emails)
    let user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

    if (!user) {
      // Create new user for first-time Google sign-in
      user = await User.create({
        name: name,
        email: email,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password for social logins
        provider: "google",
        address: "Address not provided (Google Login)",
        profileImage: picture,
        isVerified: true, // Google accounts are pre-verified
        googleId: googleId
      });
      console.log("New user created via Google Login:", user._id);
    } else {
      // Update existing user with Google ID and provider if not present
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.profileImage) {
        user.profileImage = picture;
        needsSave = true;
      }
      if (user.provider !== "google" && user.provider !== "local_and_google") {
        user.provider = "local_and_google"; // Mark as linked
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      
      if (needsSave) {
        await user.save();
      }
      console.log("Existing user logged in via Google:", user._id);
    }

    // Check if professional
    const professional = await ProfessionalModel.findOne({ 
      $or: [{ email: user.email }, { userId: user._id }], 
      verificationStatus: "verified" 
    });

    // Generate platform JWT
    const token = jwt.sign(
      { id: user._id, role: professional ? "professional" : "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      userId: user._id,
      name: user.name,
      role: professional ? "professional" : "user",
      verified: true
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google authentication failed", error: err.message });
  }
});

/* =========================
   FIND USER (FOR MESSAGING)
========================= */
router.get("/find", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Try finding in User collection first
    let user = await User.findOne({ email }).select('name profileImage email');
    
    // If not found in User, check Professional collection
    if (!user) {
      const professional = await ProfessionalModel.findOne({ email });
      if (professional && professional.userId) {
        user = await User.findById(professional.userId).select('name profileImage email');
      } else if (professional) {
         // If for some reason there's no userId link but they are a professional, 
         // we might need to handle this or just return the professional data 
         // but the message system requires a User ID.
         return res.status(404).json({ message: "This professional is not linked to a user account." });
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Find user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOCATION UPDATES
========================= */
router.put("/update-location", verifyToken, updateLocation);
router.get("/nearby-professionals", verifyToken, getNearbyProfessionals);

/* =========================
   UPDATE PROFILE
========================= */
router.put("/:userId/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, location, username, profileImage } = req.body;

    console.log("Profile update request for userId:", userId);
    console.log("Request body fields:", { firstName, lastName, email, phone, location, username });
    console.log("Profile image provided:", !!profileImage);
    console.log("File uploaded:", !!req.file);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // Update legacy name field
    if (firstName || lastName) {
        user.name = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim();
    }
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) {
      user.address = location;
      user.formattedAddress = location;
    }
    if (username) user.username = username;

    // Handle profile image optimization
    if (req.file || (profileImage && profileImage.startsWith("data:"))) {
      const filename = `opt-profile-${userId}-${Date.now()}.webp`;
      const optimizedPath = path.join(uploadsDir, filename);
      const relativePath = `uploads/${filename}`;

      try {
        if (req.file) {
          // Process uploaded file
          await sharp(req.file.path)
            .resize(500, 500, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(optimizedPath);
          
          fs.unlinkSync(req.file.path); // Delete original
        } else {
          // Process base64 string
          const base64Data = profileImage.split(';base64,').pop();
          const buffer = Buffer.from(base64Data, 'base64');
          
          await sharp(buffer)
            .resize(500, 500, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(optimizedPath);
        }
        
        user.profileImage = relativePath;
        console.log("✅ Profile image optimized and saved to disk:", relativePath);
      } catch (sharpError) {
        console.error("⚠️ Sharp optimization failed, falling back to original logic:", sharpError);
        // Fallback for safety if sharp fails
        if (req.file) {
          const imageData = fs.readFileSync(req.file.path);
          user.profileImage = `data:${req.file.mimetype};base64,${imageData.toString("base64")}`;
          fs.unlinkSync(req.file.path);
        } else {
          user.profileImage = profileImage;
        }
      }
    } else {
      console.log("No new profile image provided or updated");
    }

    await user.save();
    console.log("User profile saved successfully");

    // SYNC: Also update linked Professional profile if it exists
    try {
      const professionalUpdate = {};
      if (firstName) professionalUpdate.firstName = firstName;
      if (lastName) professionalUpdate.lastName = lastName;
      if (email) professionalUpdate.email = email;
      if (phone) professionalUpdate.phone = phone;
      if (location) {
        professionalUpdate.serviceArea = location;
        professionalUpdate.formattedAddress = location;
      }
      if (user.profileImage) professionalUpdate.profileImage = user.profileImage;
      if (username) professionalUpdate.username = username;

      const pro = await ProfessionalModel.findOneAndUpdate(
        { userId: userId },
        { $set: professionalUpdate },
        { new: true }
      );
      if (pro) {
        console.log("Synchronized Professional profile for userId:", userId);
      }
    } catch (syncErr) {
      console.error("Failed to sync Professional profile:", syncErr);
      // Non-blocking for the user
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        formattedAddress: user.formattedAddress,
        hasProfileImage: !!user.profileImage,
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile: " + err.message });
  }
});

/* =========================
   GET USER PROFILE
========================= */
router.get("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User profile retrieved",
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        address: user.address,
        username: user.username,
        profileImage: user.profileImage,
        formattedAddress: user.formattedAddress,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* =========================
   CHANGE PASSWORD
========================= */
router.put("/:userId/change-password", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid current password" });

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: "New password does not meet the security requirements." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to update password: " + err.message });
  }
});

export default router;
