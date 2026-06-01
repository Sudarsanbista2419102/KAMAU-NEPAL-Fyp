import axios from 'axios';

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kamau-nepal-fyp.onrender.com';
const API_URL = `${API_BASE_URL}/api/messages`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Send a new message
 */
export const sendMessage = async (messageData) => {
    try {
        const response = await axios.post(`${API_URL}`, messageData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get messages by category (inbox, sent, archived, starred)
 */
export const getMessages = async (category = 'inbox') => {
    try {
        const response = await axios.get(`${API_URL}?category=${category}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update message status (read, star, archive)
 */
export const updateMessageStatus = async (id, statusData) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, statusData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a message
 */
export const deleteMessage = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
/**
 * Get all conversations
 */
export const getConversations = async () => {
    try {
        const response = await axios.get(`${API_URL}/conversations`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get message thread with a user
 */
export const getMessageThread = async (otherUserId) => {
    try {
        const response = await axios.get(`${API_URL}/thread/${otherUserId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Upload message attachment
 */
export const uploadAttachment = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get total unread messages count
 */
export const getUnreadCount = async () => {
    try {
        const response = await axios.get(`${API_URL}/unread-count`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
