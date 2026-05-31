import express from 'express';
import {
  getDashboardStats,
  getAllProfessionalsForAdmin,
  getPendingApplications,
  getCategoryDistribution,
  getStatusDistribution,
  getRecentApplications,
  getApplicationDetails,
  approveProfessional,
  rejectProfessional,
  getAnalyticsData,
  searchProfessionals,
  exportData,
  broadcastNotification,
  getAllUsers,
  deleteUser,
  deleteProfessional,
  getRevenueAnalytics,
  blockProfessional,
  unblockProfessional,
  updateProfessionalServiceStatus,
  checkAndAutoUnblockProfessionals,
} from './controllers/adminController.js';
import { verifyAdminToken, checkAdminRole } from './adminAuthMiddleware.js';

const router = express.Router();

// Apply admin verification middleware to all routes
router.use(verifyAdminToken);
router.use(checkAdminRole);

/**
 * Admin Routes
 * All routes are prefixed with /api/admin
 */

// Dashboard
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// GET /api/admin/dashboard/analytics
router.get('/dashboard/analytics', getAnalyticsData);

// GET /api/admin/dashboard/recent
router.get('/dashboard/recent', getRecentApplications);

// Professionals Management
// GET /api/admin/professionals?page=1&limit=20&status=pending&serviceCategory=plumbing
router.get('/professionals', getAllProfessionalsForAdmin);

// GET /api/admin/users?page=1&limit=20&search=ram
router.get('/users', getAllUsers);

// GET /api/admin/professionals/search?search=ram&status=pending&category=plumbing&area=thamel
router.get('/professionals/search', searchProfessionals);

// GET /api/admin/professionals/pending
router.get('/professionals/pending', getPendingApplications);

// GET /api/admin/professionals/:id
router.get('/professionals/:id', getApplicationDetails);

// Application Management
// PATCH /api/admin/applications/:id/approve
router.patch('/applications/:id/approve', approveProfessional);

// PATCH /api/admin/applications/:id/reject
// Body: { rejectionReason: "reason" }
router.patch('/applications/:id/reject', rejectProfessional);

// Analytics
// GET /api/admin/analytics/categories
router.get('/analytics/categories', getCategoryDistribution);

// GET /api/admin/analytics/status
router.get('/analytics/status', getStatusDistribution);

// GET /api/admin/analytics/revenue
router.get('/analytics/revenue', getRevenueAnalytics);

// Export
// GET /api/admin/export?format=json&status=verified
router.get('/export', exportData);

// Broadcast Notification
// POST /api/admin/broadcast
// Body: { recipient: 'all'|'users'|'professionals', title, message }
router.post('/broadcast', broadcastNotification);

// Delete User
// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// Delete Professional
// DELETE /api/admin/professionals/:id
router.delete('/professionals/:id', deleteProfessional);

// PATCH /api/admin/professionals/:id/block
router.patch('/professionals/:id/block', blockProfessional);

// PATCH /api/admin/professionals/:id/unblock
router.patch('/professionals/:id/unblock', unblockProfessional);

// PATCH /api/admin/professionals/:id/service-status
// Body: { liveStatus: 'Free'|'Ongoing'|'Offline' }
router.patch('/professionals/:id/service-status', updateProfessionalServiceStatus);

// POST /api/admin/check-and-auto-unblock
// Check for expired blocks and auto-unblock professionals
router.post('/check-and-auto-unblock', async (req, res) => {
  try {
    const result = await checkAndAutoUnblockProfessionals();
    return res.status(200).json({
      success: true,
      message: `Auto-unblocked ${result.unblocked} professional(s)`,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check and auto-unblock professionals',
      error: error.message
    });
  }
});

export default router;
