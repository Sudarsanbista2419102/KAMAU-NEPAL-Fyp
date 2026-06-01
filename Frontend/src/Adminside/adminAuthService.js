import axios from "axios";

const API_URL = "/api/auth";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Admin Login
 * @param {String} username - Admin username or email
 * @param {String} password - Admin password
 * @returns {Promise} Login response with token
 */
export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      username,
      password
    });

    if (response.data.success) {
      // Store token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.data));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Login failed"
    };
  }
};

/**
 * Verify admin token
 * @returns {Promise} Verification response
 */
export const verifyAdminToken = async () => {
  try {
    const response = await axiosInstance.post('/admin/verify');
    return response.data;
  } catch (error) {
    // Clear stored data if token is invalid
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    throw error.response?.data || {
      success: false,
      message: "Token verification failed"
    };
  }
};

/**
 * Admin Logout
 * @returns {Promise} Logout response
 */
export const adminLogout = async () => {
  try {
    const response = await axiosInstance.post('/admin/logout');

    // Clear stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Logout failed"
    };
  }
};

/**
 * Get admin profile
 * @returns {Promise} Admin profile data
 */
export const getAdminProfile = async () => {
  try {
    const response = await axiosInstance.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to fetch profile"
    };
  }
};

/**
 * Update admin profile
 * @param {String} fullName - Admin full name
 * @returns {Promise} Updated profile data
 */
export const updateAdminProfile = async (fullName) => {
  try {
    const response = await axiosInstance.put('/admin/profile', { fullName });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to update profile"
    };
  }
};

/**
 * Change admin password
 * @param {String} oldPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise} Change password response
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axiosInstance.post('/admin/change-password', {
      oldPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: "Failed to change password"
    };
  }
};

/**
 * Check if admin is logged in
 * @returns {Boolean} True if admin is logged in
 */
export const isAdminLoggedIn = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

/**
 * Get stored admin user
 * @returns {Object} Stored admin user data or null
 */
export const getStoredAdminUser = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

const authService = {
  adminLogin,
  verifyAdminToken,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  isAdminLoggedIn,
  getStoredAdminUser
};

export default authService;
