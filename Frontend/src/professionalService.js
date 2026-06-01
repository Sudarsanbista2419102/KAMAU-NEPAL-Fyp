import axios from "axios";

const API_URL = "/api/professionals";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data"
  }
});

/**
 * Register a new professional service provider
 * @param {Object} formData - Form data containing professional details
 * @param {File} profileImage - Profile image file
 * @param {FileList} documents - Verification documents
 * @returns {Promise} API response
 */
export const registerProfessional = async (formData, profileImage, documents) => {
  try {
    const data = new FormData();

    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // Add profile image
    if (profileImage) {
      data.append("profileImage", profileImage);
    }

    // Add documents
    if (documents && documents.length > 0) {
      Array.from(documents).forEach((doc) => {
        data.append("documents", doc);
      });
    }

    const response = await axios.post(`${API_URL}/register`, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Registration failed" 
    };
  }
};

/**
 * Get all professionals with pagination and filters
 * @param {Object} params - Query parameters (page, limit, serviceCategory, serviceArea, verificationStatus)
 * @returns {Promise} List of professionals
 */
export const getAllProfessionals = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to fetch professionals" 
    };
  }
};

/**
 * Search professionals by filters
 * @param {Object} filters - Filter parameters (serviceCategory, serviceArea)
 * @returns {Promise} List of matching professionals
 */
export const searchProfessionals = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Search failed" 
    };
  }
};

/**
 * Get professional profile by ID
 * @param {String} id - Professional MongoDB ID
 * @returns {Promise} Professional profile data
 */
export const getProfessionalProfile = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to fetch profile" 
    };
  }
};

/**
 * Get professional by username
 * @param {String} username - Professional username
 * @returns {Promise} Professional profile data
 */
export const getProfessionalByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/user/${username}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Professional not found" 
    };
  }
};

/**
 * Update professional profile
 * @param {String} id - Professional MongoDB ID
 * @param {Object} updateData - Data to update
 * @param {File} profileImage - New profile image (optional)
 * @returns {Promise} Updated professional data
 */
export const updateProfessionalProfile = async (id, updateData, profileImage = null) => {
  try {
    const data = new FormData();

    // Add update fields
    Object.entries(updateData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // Add profile image if provided
    if (profileImage) {
      data.append("profileImage", profileImage);
    }

    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to update profile" 
    };
  }
};

/**
 * Delete professional profile
 * @param {String} id - Professional MongoDB ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteProfessionalProfile = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to delete profile" 
    };
  }
};

/**
 * Get pending professional applications (Admin only)
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} List of pending applications
 */
export const getPendingApplications = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/pending`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to fetch applications" 
    };
  }
};

/**
 * Verify or reject professional (Admin only)
 * @param {String} id - Professional MongoDB ID
 * @param {String} status - 'verified' or 'rejected'
 * @param {String} rejectionReason - Reason if rejected (optional)
 * @returns {Promise} Verification result
 */
export const verifyProfessional = async (id, status, rejectionReason = null) => {
  try {
    const response = await axios.patch(`${API_URL}/admin/verify/${id}`, {
      status,
      rejectionReason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Verification failed" 
    };
  }
};

/**
 * Get verified professionals by category
 * @param {String} serviceCategory - Service category
 * @returns {Promise} List of professionals in that category
 */
export const getProfessionalsByCategory = async (serviceCategory) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { serviceCategory }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to fetch professionals" 
    };
  }
};

/**
 * Get verified professionals by service area
 * @param {String} serviceArea - Service area
 * @returns {Promise} List of professionals in that area
 */
export const getProfessionalsByArea = async (serviceArea) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { serviceArea }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: "Failed to fetch professionals" 
    };
  }
};

export default {
  registerProfessional,
  getAllProfessionals,
  searchProfessionals,
  getProfessionalProfile,
  getProfessionalByUsername,
  updateProfessionalProfile,
  deleteProfessionalProfile,
  getPendingApplications,
  verifyProfessional,
  getProfessionalsByCategory,
  getProfessionalsByArea
};
