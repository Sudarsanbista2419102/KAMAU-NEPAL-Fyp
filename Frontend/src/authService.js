import axios from "axios";

// Use environment variable for API base URL, fallback to relative path for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const API_URL = `${API_BASE_URL}/api/users`;

export const signup = async (data) => {
  const res = await axios.post(`${API_URL}/signup`, data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await axios.post(`${API_URL}/verify-otp`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
