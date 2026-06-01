import axios from 'axios';

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kamau-nepal-fyp.onrender.com';
const API_URL = `${API_BASE_URL}/api/reviews`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Submit a new review for a professional
 */
export const submitReview = async ({ professionalId, userId, userName, rating, comment }) => {
    const response = await axios.post(
        `${API_URL}/`,
        { professionalId, userId, userName, rating, comment },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Get all reviews for a professional
 */
export const getProfessionalReviews = async (professionalId) => {
    const response = await axios.get(`${API_URL}/professional/${professionalId}`);
    return response.data;
};

/**
 * Delete a review by id
 */
export const deleteReview = async (reviewId) => {
    const response = await axios.delete(`${API_URL}/${reviewId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};
