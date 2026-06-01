// Use environment variable for API base URL, fallback to relative path for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const API_URL = `${API_BASE_URL}/api/notifications`;

const notificationService = {
  getNotifications: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  deleteNotification: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }
};

export default notificationService;
