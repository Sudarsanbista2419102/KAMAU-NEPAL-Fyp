import express from 'express';
import {
  adminLogin,
  verifyToken,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  changePassword
} from './controllers/authController.js';
import { verifyAdminToken } from './adminAuthMiddleware.js';

const router = express.Router();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

// POST /api/auth/admin/login
// Body: { username: "admin", password: "password123" }
router.post('/admin/login', adminLogin);

// POST /api/auth/admin/verify
// Headers: Authorization: Bearer <token>
router.post('/admin/verify', verifyToken);

// POST /api/auth/admin/logout
router.post('/admin/logout', adminLogout);

// Protected Routes
// GET /api/auth/admin/profile
router.get('/admin/profile', verifyAdminToken, getAdminProfile);

// PUT /api/auth/admin/profile
// Body: { fullName: "New Name" }
router.put('/admin/profile', verifyAdminToken, updateAdminProfile);

// POST /api/auth/admin/change-password
// Body: { oldPassword: "old", newPassword: "new" }
router.post('/admin/change-password', verifyAdminToken, changePassword);

export default router;
