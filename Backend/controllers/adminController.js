import ProfessionalModel from '../models/professionalModel.js';
import UserModel from '../models/userModel.js';
import NotificationModel from '../models/notificationModel.js';
import { sendCongratulationsEmail, sendRejectionEmail } from '../utils/sendOtp.js';
import BookingModel from '../models/bookingModel.js';

/**
 * Get revenue analytics for the platform
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getRevenueAnalytics = async (req, res) => {
  try {
    const paidBookings = await BookingModel.find({ paymentStatus: 'Paid' });
    
    // Calculate total revenue
    const totalRevenue = paidBookings.reduce((sum, booking) => {
      // Extract numeric value from "रू 9,700" string
      const costStr = booking.totalCost || "0";
      const numericValue = parseInt(costStr.replace(/[^\d]/g, '')) || 0;
      return sum + numericValue;
    }, 0);

    // Revenue by category
    const categoryRevenue = await BookingModel.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$serviceTitle',
          total: { $sum: { $convert: { 
            input: { $replaceAll: { input: "$totalCost", find: "रू ", replacement: "" } },
            to: "int",
            onError: 0,
            onNull: 0
          } } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Revenue over time (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayBookings = await BookingModel.find({
        paymentStatus: 'Paid',
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const dayRevenue = dayBookings.reduce((sum, b) => {
        const costStr = b.totalCost || "0";
        return sum + (parseInt(costStr.replace(/[^\d]/g, '')) || 0);
      }, 0);

      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayRevenue
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        categoryRevenue: categoryRevenue.map(item => ({
          name: item._id,
          value: item.total
        })),
        timeline: last7Days
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

/**
 * Get admin dashboard statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await ProfessionalModel.countDocuments();
    const totalPending = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });
    const totalApproved = await ProfessionalModel.countDocuments({ verificationStatus: 'verified' });
    const totalRejected = await ProfessionalModel.countDocuments({ verificationStatus: 'rejected' });
    const totalUsers = await UserModel.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        totalPending,
        totalApproved,
        totalRejected,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get all professionals with filters for admin view
 * @param {Object} req - Request object (query params: page, limit, status, serviceCategory)
 * @param {Object} res - Response object
 */
export const getAllProfessionalsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceCategory } = req.query;

    const query = {};
    if (status) {
      query.verificationStatus = status;
    }
    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professionals',
      error: error.message
    });
  }
};

/**
 * Get pending applications for admin review
 * @param {Object} req - Request object (query params: page, limit)
 * @param {Object} res - Response object
 */
export const getPendingApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await ProfessionalModel.find({ verificationStatus: 'pending' })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error.message
    });
  }
};

/**
 * Get category distribution for analytics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await ProfessionalModel.aggregate([
      { $match: { verificationStatus: 'verified' } },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedData = distribution.map(item => ({
      category: item._id,
      count: item.count
    }));

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category distribution',
      error: error.message
    });
  }
};

/**
 * Get status distribution (pending, approved, rejected)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getStatusDistribution = async (req, res) => {
  try {
    const distribution = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedData = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    distribution.forEach(item => {
      if (item._id === 'pending') formattedData.pending = item.count;
      else if (item._id === 'verified') formattedData.verified = item.count;
      else if (item._id === 'rejected') formattedData.rejected = item.count;
    });

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch status distribution',
      error: error.message
    });
  }
};

/**
 * Get recent applications (for dashboard display)
 * @param {Object} req - Request object (query params: limit)
 * @param {Object} res - Response object
 */
export const getRecentApplications = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const applications = await ProfessionalModel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent applications',
      error: error.message
    });
  }
};

/**
 * Get detailed application information
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ProfessionalModel.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
};

/**
 * Approve a professional application
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const approveProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      {
        verificationStatus: 'verified',
        isVerified: true,
        verificationDate: new Date()
      },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    // Send notification to the user
    if (professional.userId) {
      await NotificationModel.create({
        userId: professional.userId,
        type: 'system',
        title: 'Professional Profile Verified!',
        description: 'Congratulations! Your professional profile has been approved. You can now access the Professional Dashboard to manage requests.',
      });
    }

    // Send congratulations email
    const professionalName = `${professional.firstName} ${professional.lastName}`;
    const emailSent = await sendCongratulationsEmail(
      professional.email,
      professionalName,
      professional.serviceCategory
    );

    if (emailSent) {
      console.log(`🎉 Congratulations email sent to ${professional.email} for approved professional: ${professionalName}`);
    } else {
      console.log(`⚠️ Congratulations email failed for ${professional.email}, but approval was successful`);
    }

    return res.status(200).json({
      success: true,
      message: 'Professional approved successfully',
      data: professional,
      emailSent: emailSent
    });
  } catch (error) {
    console.error('Error approving professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve professional',
      error: error.message
    });
  }
};

/**
 * Reject a professional application
 * @param {Object} req - Request object (params: id, body: rejectionReason)
 * @param {Object} res - Response object
 */
export const rejectProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      {
        verificationStatus: 'rejected',
        isVerified: false,
        rejectionReason,
        verificationDate: new Date()
      },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    // Send notification to the user
    if (professional.userId) {
      await NotificationModel.create({
        userId: professional.userId,
        type: 'system',
        title: 'Professional Profile Update',
        description: `Your professional profile application was not approved at this time. Reason: ${rejectionReason}. You are welcome to submit a new application after addressing the reasons for rejection.`,
      });
    }

    // Send rejection email
    const professionalName = `${professional.firstName} ${professional.lastName}`;
    const emailSent = await sendRejectionEmail(
      professional.email,
      professionalName,
      professional.serviceCategory,
      rejectionReason
    );

    if (emailSent) {
      console.log(`📧 Rejection email sent to ${professional.email} for rejected professional: ${professionalName}`);
    } else {
      console.log(`⚠️ Rejection email failed for ${professional.email}, but rejection was successful`);
    }

    return res.status(200).json({
      success: true,
      message: 'Professional rejected successfully',
      data: professional,
      emailSent: emailSent
    });
  } catch (error) {
    console.error('Error rejecting professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject professional',
      error: error.message
    });
  }
};

/**
 * Get analytics data (statistics over time, category trends, etc.)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAnalyticsData = async (req, res) => {
  try {
    // Total statistics
    const totalProfessionals = await ProfessionalModel.countDocuments();
    const verifiedCount = await ProfessionalModel.countDocuments({ verificationStatus: 'verified' });
    const pendingCount = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });
    const rejectedCount = await ProfessionalModel.countDocuments({ verificationStatus: 'rejected' });

    // Average hourly wage
    const avgWageData = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: null,
          averageWage: { $avg: '$hourlyWage' }
        }
      }
    ]);

    const averageWage = avgWageData.length > 0 ? avgWageData[0].averageWage : 0;

    // Top categories
    const topCategories = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top areas
    const topAreas = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$serviceArea',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Live Status Distribution
    const liveStatusDistribution = await ProfessionalModel.aggregate([
      {
        $group: {
          _id: '$liveStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Ensure all statuses are represented
    const statusMap = {
      'Free': 0,
      'Ongoing': 0,
      'Offline': 0
    };

    liveStatusDistribution.forEach(item => {
      const status = item._id || 'Free';
      if (statusMap.hasOwnProperty(status)) {
        statusMap[status] = item.count;
      }
    });

    const finalDistribution = Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status]
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalProfessionals,
        verified: verifiedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        averageHourlyWage: Math.round(averageWage),
        topCategories: topCategories.map(cat => ({
          category: cat._id,
          count: cat.count
        })),
        topAreas: topAreas.map(area => ({
          area: area._id,
          count: area.count
        })),
        liveStatusDistribution: finalDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

/**
 * Search professionals with multiple filters
 * @param {Object} req - Request object (query params: search, status, category, area, page, limit)
 * @param {Object} res - Response object
 */
export const searchProfessionals = async (req, res) => {
  try {
    const { search, status, category, area, page = 1, limit = 20 } = req.query;

    const query = {};

    // Search by name, email, or username
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.verificationStatus = status;
    }

    if (category) {
      query.serviceCategory = category;
    }

    if (area) {
      query.serviceArea = area;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Export data (CSV/JSON)
 * @param {Object} req - Request object (query params: format, status)
 * @param {Object} res - Response object
 */
export const exportData = async (req, res) => {
  try {
    const { format = 'json', status } = req.query;

    const query = status ? { verificationStatus: status } : {};
    const professionals = await ProfessionalModel.find(query).select('-verificationDocuments');

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(professionals);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="professionals.csv"');
      return res.send(csv);
    }

    // Default JSON format
    return res.status(200).json({
      success: true,
      data: professionals
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

/**
 * Helper function to convert data to CSV
 */
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Service', 'Area', 'Wage', 'Status', 'Created At'];
  const rows = data.map(item => [
    item.firstName,
    item.lastName,
    item.email,
    item.phone,
    item.serviceCategory,
    item.serviceArea,
    item.hourlyWage,
    item.verificationStatus,
    new Date(item.createdAt).toLocaleDateString()
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  return csv;
};

/**
 * Broadcast a notification to all users, professionals, or both
 * Body: { recipient: 'all'|'users'|'professionals', title, message }
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { recipient, title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let userIds = [];

    if (recipient === 'all' || recipient === 'users') {
      const users = await UserModel.find({}, '_id');
      userIds.push(...users.map(u => u._id));
    }

    if (recipient === 'all' || recipient === 'professionals') {
      const professionals = await ProfessionalModel.find({}, 'userId');
      const proUserIds = professionals.map(p => p.userId).filter(Boolean);
      // Avoid duplicates if 'all'
      const existingSet = new Set(userIds.map(id => id.toString()));
      proUserIds.forEach(id => {
        if (!existingSet.has(id.toString())) {
          userIds.push(id);
          existingSet.add(id.toString());
        }
      });
    }

    if (userIds.length === 0) {
      return res.status(404).json({ success: false, message: 'No recipients found' });
    }

    const notifications = userIds.map(userId => ({
      userId,
      type: 'system',
      title,
      description: message,
    }));

    await NotificationModel.insertMany(notifications);

    return res.status(200).json({
      success: true,
      message: `Notification sent to ${userIds.length} recipient(s)`,
      count: userIds.length,
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast notification',
      error: error.message,
    });
  }
};

/**
 * Get all registered users for admin view
 * @param {Object} req - Request object (query params: page, limit, search)
 * @param {Object} res - Response object
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    // Enrich users with their professional data
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const professional = await ProfessionalModel.findOne({ userId: user._id });
      return {
        ...user.toObject(),
        isProfessional: !!professional,
        professionalStatus: professional?.verificationStatus || null,
        professionalId: professional?._id || null,
        serviceCategory: professional?.serviceCategory || null
      };
    }));

    return res.status(200).json({
      success: true,
      data: enrichedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Delete a user and their associated professional profile if it exists
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete associated professional profile if it exists
    await ProfessionalModel.findOneAndDelete({ userId: id });

    // Delete the user
    await UserModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'User and associated records deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * Delete a professional profile (keeps the user account)
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // Send notification to the user before deleting
    if (professional.userId) {
      await NotificationModel.create({
        userId: professional.userId,
        type: 'system',
        title: 'Professional Profile Removed',
        description: 'Your professional profile has been removed by the administrator. You are free to register again if you wish to restart your application.',
      });
    }

    // Delete the professional profile
    await ProfessionalModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Professional profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete professional',
      error: error.message
    });
  }
};

/**
 * Block a professional for a specific duration
 * @param {Object} req - Request object (params: id, body: days)
 * @param {Object} res - Response object
 */
export const blockProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 3 } = req.body;

    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + days);

    professional.isBlocked = true;
    professional.blockedUntil = blockedUntil;
    professional.liveStatus = 'Offline'; // Force offline when blocked
    await professional.save();

    // Notify the professional
    if (professional.userId) {
      await NotificationModel.create({
        userId: professional.userId,
        type: 'warning',
        title: 'Account Suspended',
        description: `Your professional account has been suspended for ${days} days due to reported behavior. You will be able to resume services after ${blockedUntil.toLocaleDateString()}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Professional blocked until ${blockedUntil.toLocaleDateString()}`,
      data: professional
    });
  } catch (error) {
    console.error('Error blocking professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to block professional',
      error: error.message
    });
  }
};

/**
 * Unblock a professional (restore access)
 * @param {Object} req - Request object (params: id)
 * @param {Object} res - Response object
 */
export const unblockProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    professional.isBlocked = false;
    professional.blockedUntil = null;
    professional.liveStatus = 'Free'; // Restore to active status
    await professional.save();

    // Notify the professional
    if (professional.userId) {
      await NotificationModel.create({
        userId: professional.userId,
        type: 'success',
        title: 'Account Restored',
        description: 'Your professional account has been restored. You can now resume accepting service requests and appear in search results.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional unblocked successfully',
      data: professional
    });
  } catch (error) {
    console.error('Error unblocking professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unblock professional',
      error: error.message
    });
  }
};

/**
 * Update professional's service status (liveStatus)
 * @param {Object} req - Request object (params: id, body: liveStatus)
 * @param {Object} res - Response object
 */
export const updateProfessionalServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { liveStatus } = req.body;

    if (!liveStatus || !['Free', 'Ongoing', 'Offline'].includes(liveStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service status. Must be Free, Ongoing, or Offline'
      });
    }

    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    // Only allow status update for verified professionals
    if (professional.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Only verified professionals can have their service status updated'
      });
    }

    professional.liveStatus = liveStatus;
    await professional.save();

    return res.status(200).json({
      success: true,
      message: `Service status updated to ${liveStatus}`,
      data: professional
    });
  } catch (error) {
    console.error('Error updating professional service status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update service status',
      error: error.message
    });
  }
};

/**
 * Check and auto-unblock professionals whose block period has expired
 * @returns {Promise} Resolves with number of auto-unblocked professionals
 */
export const checkAndAutoUnblockProfessionals = async () => {
  try {
    const now = new Date();
    const blockedProfessionals = await ProfessionalModel.find({
      isBlocked: true,
      blockedUntil: { $lt: now }
    });

    if (blockedProfessionals.length === 0) {
      return { success: true, unblocked: 0 };
    }

    const result = await ProfessionalModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lt: now }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null,
          liveStatus: 'Free'
        }
      }
    );

    // Notify unblocked professionals
    for (const professional of blockedProfessionals) {
      if (professional.userId) {
        await NotificationModel.create({
          userId: professional.userId,
          type: 'success',
          title: 'Account Access Restored',
          description: 'Your professional account block period has expired. Your account has been automatically restored.',
        });
      }
    }

    console.log(`Auto-unblocked ${result.modifiedCount} professionals`);
    return { success: true, unblocked: result.modifiedCount };
  } catch (error) {
    console.error('Error in auto-unblocking professionals:', error);
    return { success: false, error: error.message };
  }
};
