import AdminModel from '../models/adminModel.js';
import jwt from 'jsonwebtoken';

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables. Using fallback (not secure for production).");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

/**
 * Admin Login
 * @param {Object} req - Request object (body: username/email, password)
 * @param {Object} res - Response object
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin by username or email
    const admin = await AdminModel.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Keep only last 10 login records
    if (admin.loginHistory.length > 10) {
      admin.loginHistory = admin.loginHistory.slice(-10);
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Verify token
 * @param {Object} req - Request object (headers: authorization)
 * @param {Object} res - Response object
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify admin still exists and is active
    const admin = await AdminModel.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

/**
 * Admin Logout (optional - mainly for clearing client-side)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const adminLogout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

/**
 * Get admin profile
 * @param {Object} req - Request object (user from middleware)
 * @param {Object} res - Response object
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update admin profile
 * @param {Object} req - Request object (user from middleware, body: fullName)
 * @param {Object} res - Response object
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName } = req.body;

    const admin = await AdminModel.findByIdAndUpdate(
      req.user.id,
      { fullName, updatedAt: new Date() },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Change password
 * @param {Object} req - Request object (user from middleware, body: oldPassword, newPassword)
 * @param {Object} res - Response object
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old and new passwords are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const admin = await AdminModel.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify old password
    const isPasswordValid = await admin.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};
