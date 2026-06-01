import api from "./services/apiInstance";

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kamau-nepal-fyp.onrender.com';
const API_URL = `${API_BASE_URL}/api/users`;

export const signup = async (data) => {
  const res = await api.post(`/api/users/signup`, data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post(`/api/users/verify-otp`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post(`/api/users/login`, data);
  return res.data;
};
