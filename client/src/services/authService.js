import axios from 'axios';

const API_URL = '/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
};

// Get user profile
const getProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`);
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const response = await axios.put(`${API_URL}/profile`, userData);
  return response.data;
};

// Change password
const changePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/change-password`, passwordData);
  return response.data;
};

// Reset password request
const requestPasswordReset = async (email) => {
  const response = await axios.post(`${API_URL}/reset-password`, { email });
  return response.data;
};

// Reset password with token
const resetPassword = async (token, password) => {
  const response = await axios.put(`${API_URL}/reset-password/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
};

export default authService;