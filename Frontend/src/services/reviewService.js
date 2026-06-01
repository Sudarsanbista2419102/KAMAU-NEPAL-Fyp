import axios from 'axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Submit a new review for a professional
 */
export const submitReview = async ({ professionalId, userId, userName, rating, comment }) => {
    const response = await axios.post(
        '/api/reviews/',
        { professionalId, userId, userName, rating, comment },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

/**
 * Get all reviews for a professional
 */
export const getProfessionalReviews = async (professionalId) => {
    const response = await axios.get(`/api/reviews/professional/${professionalId}`);
    return response.data;
};

/**
 * Delete a review by id
 */
export const deleteReview = async (reviewId) => {
    const response = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};
