import axios from 'axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Send a new message
 */
export const sendMessage = async (messageData) => {
    try {
        const response = await axios.post('/api/messages', messageData, {
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
        const response = await axios.get(`/api/messages?category=${category}`, {
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
        const response = await axios.patch(`/api/messages/${id}`, statusData, {
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
        const response = await axios.delete(`/api/messages/${id}`, {
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
        const response = await axios.get('/api/messages/conversations', {
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
        const response = await axios.get(`/api/messages/thread/${otherUserId}`, {
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
        
        const response = await axios.post('/api/messages/upload', formData, {
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
        const response = await axios.get('/api/messages/unread-count', {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
