import axios from 'axios';

/**
 * Centralized API Service for Kamau Nepal
 * Best Practice: Using an axios instance allows for global configuration 
 * (base URL, headers, interceptors) in one place.
 */

// Use proxy setting from package.json (webpack-dev-server will handle routing)
// In development, requests to /api/* are proxied to http://127.0.0.1:5001
// In production, uses the environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kamau-nepal-fyp.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('404 Not Found:', error.config?.url);
      console.error('Backend might not be running or route not registered');
    }
    return Promise.reject(error);
  }
);

export default api;
