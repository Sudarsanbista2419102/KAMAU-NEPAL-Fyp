import api from '../services/apiInstance';

const API_URL = '/api/admin';

/**
 * Get dashboard statistics
 * @returns {Promise} Dashboard stats (totalApplications, pending, approved, rejected)
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get(`${API_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch dashboard stats",
    };
  }
};

/**
 * Get analytics data
 * @returns {Promise} Comprehensive analytics (total, verified, pending, rejected, averageWage, topCategories, topAreas)
 */
export const getAnalyticsData = async () => {
  try {
    const response = await api.get(`${API_URL}/dashboard/analytics`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch analytics",
    };
  }
};

/**
 * Get recent applications
 * @param {Object} params - Query parameters (limit)
 * @returns {Promise} List of recent applications
 */
export const getRecentApplications = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/dashboard/recent`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch recent applications",
    };
  }
};

/**
 * Get all professionals for admin view
 * @param {Object} params - Query parameters (page, limit, status, serviceCategory)
 * @returns {Promise} List of professionals with pagination
 */
export const getAllProfessionalsForAdmin = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/professionals`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch professionals",
    };
  }
};

/**
 * Search professionals with multiple filters
 * @param {Object} params - Query parameters (search, status, category, area, page, limit)
 * @returns {Promise} List of professionals with pagination
 */
export const searchProfessionals = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/professionals/search`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Search failed",
    };
  }
};

/**
 * Get pending applications
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} List of pending applications
 */
export const getPendingApplications = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/professionals/pending`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch pending applications",
    };
  }
};

/**
 * Get application details
 * @param {String} id - Application MongoDB ID
 * @returns {Promise} Complete application details with documents
 */
export const getApplicationDetails = async (id) => {
  try {
    const response = await api.get(`${API_URL}/professionals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch application details",
    };
  }
};

/**
 * Approve professional application
 * @param {String} id - Application MongoDB ID
 * @returns {Promise} Updated professional data
 */
export const approveProfessional = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/applications/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to approve professional",
    };
  }
};

/**
 * Reject professional application
 * @param {String} id - Application MongoDB ID
 * @param {String} rejectionReason - Reason for rejection
 * @returns {Promise} Updated professional data
 */
export const rejectProfessional = async (id, rejectionReason) => {
  try {
    const response = await api.patch(`${API_URL}/applications/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to reject professional",
    };
  }
};

/**
 * Get category distribution
 * @returns {Promise} Breakdown by service category
 */
export const getCategoryDistribution = async () => {
  try {
    const response = await api.get(`${API_URL}/analytics/categories`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch category distribution",
    };
  }
};

/**
 * Create a new category (supports optional image)
 */
export const createCategory = async (value, label, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('value', value);
    formData.append('label', label);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await api.post('/api/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to create category',
    };
  }
};

/**
 * Edit an existing category (supports optional image)
 */
export const editCategory = async (id, value, label, imageFile) => {
  try {
    const formData = new FormData();
    if (value) formData.append('value', value);
    if (label) formData.append('label', label);
    if (imageFile) formData.append('image', imageFile);
    const response = await api.put(`/api/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to edit category',
    };
  }
};

/**
 * Get status distribution
 * @returns {Promise} Breakdown by verification status
 */
export const getStatusDistribution = async () => {
  try {
    const response = await api.get(`${API_URL}/analytics/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch status distribution",
    };
  }
};

/**
 * Get revenue analytics
 * @returns {Promise} Revenue data (total, by category, timeline)
 */
export const getRevenueAnalytics = async () => {
  try {
    const response = await api.get(`${API_URL}/analytics/revenue`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch revenue analytics",
    };
  }
};

/**
 * Export data
 * @param {Object} params - Query parameters (format: 'json'|'csv', status)
 * @returns {Promise} Exported data
 */
export const exportData = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/export`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to export data",
    };
  }
};

/**
 * Broadcast a notification to users/professionals/all
 * @param {Object} payload - { recipient: 'all'|'users'|'professionals', title, message }
 * @returns {Promise} Result with count of recipients
 */
export const broadcastNotification = async (payload) => {
  try {
    const response = await api.post(`${API_URL}/broadcast`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to broadcast notification",
    };
  }
};

/**
 * Get all registered users for admin view
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise} List of users with pagination
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/users`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch users",
    };
  }
};

/**
 * Delete a user
 * @param {String} id - User MongoDB ID
 * @returns {Promise} Success message
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to delete user",
    };
  }
};

/**
 * Delete a professional profile
 * @param {String} id - Professional MongoDB ID
 * @returns {Promise} Success message
 */
export const deleteProfessional = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/professionals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to delete professional",
    };
  }
};

/**
 * Get all reports
 * @returns {Promise} List of reports
 */
export const getReports = async () => {
  try {
    const response = await api.get('/api/reports/all');
    return { success: true, data: response.data };
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch reports",
    };
  }
};

/**
 * Update report status
 * @param {String} id - Report ID
 * @param {Object} data - { status, adminNotes }
 * @returns {Promise} Updated report
 */
export const updateReportStatus = async (id, data) => {
  try {
    const response = await api.patch(`/api/reports/${id}/status`, data);
    return { success: true, data: response.data };
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to update report status",
    };
  }
};

/**
 * Block a professional
 * @param {String} id
 * @param {Number} days
 * @returns {Promise}
 */
export const blockProfessional = async (id, days) => {
  try {
    const response = await api.patch(`${API_URL}/professionals/${id}/block`, { days });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to block professional",
    };
  }
};

export const unblockProfessional = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/professionals/${id}/unblock`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to unblock professional",
    };
  }
};

/**
 * Update professional's service status (liveStatus)
 * @param {String} id - Professional ID
 * @param {String} status - New status ('Free', 'Ongoing', 'Offline')
 * @returns {Promise}
 */
export const updateProfessionalServiceStatus = async (id, status) => {
  try {
    const response = await api.patch(`${API_URL}/professionals/${id}/service-status`, { liveStatus: status });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to update service status",
    };
  }
};

/**
 * Get admin notifications
 * @returns {Promise} List of admin notifications
 */
export const getAdminNotifications = async () => {
  try {
    const response = await api.get(`${API_URL}/notifications`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch notifications",
    };
  }
};

/**
 * Mark notification as read
 * @param {String} id - Notification ID
 * @returns {Promise} Success message
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to mark notification as read",
    };
  }
};

// Alias for easier access
export const getAllProfessionals = getAllProfessionalsForAdmin;

const adminServiceData = {
  getDashboardStats,
  getAnalyticsData,
  getRecentApplications,
  getAllProfessionalsForAdmin,
  getAllProfessionals,
  getPendingApplications,
  getApplicationDetails,
  searchProfessionals,
  approveProfessional,
  rejectProfessional,
  getCategoryDistribution,
  createCategory,
  editCategory,
  getStatusDistribution,
  getRevenueAnalytics,
  exportData,
  broadcastNotification,
  getAllUsers,
  deleteUser,
  blockProfessional,
  unblockProfessional,
  updateProfessionalServiceStatus,
  deleteProfessional,
  getReports,
  updateReportStatus,
  getAdminNotifications,
  markNotificationAsRead,
};

export default adminServiceData;
