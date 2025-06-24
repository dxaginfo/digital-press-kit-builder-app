import axios from 'axios';

const API_URL = '/api/press-kits';

// Set the auth token for any request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all press kits
const getAllPressKits = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get press kit by ID
const getPressKitById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Get press kit by slug (public access)
const getPressKitBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/public/${slug}`);
  return response.data;
};

// Create a new press kit
const createPressKit = async (pressKitData) => {
  const response = await axios.post(API_URL, pressKitData);
  return response.data;
};

// Update an existing press kit
const updatePressKit = async (id, pressKitData) => {
  const response = await axios.put(`${API_URL}/${id}`, pressKitData);
  return response.data;
};

// Delete a press kit
const deletePressKit = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Upload media to a press kit
const uploadMedia = async (pressKitId, formData) => {
  const response = await axios.post(`${API_URL}/${pressKitId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete media from a press kit
const deleteMedia = async (pressKitId, mediaId) => {
  const response = await axios.delete(`${API_URL}/${pressKitId}/media/${mediaId}`);
  return response.data;
};

// Get analytics for a press kit
const getPressKitAnalytics = async (pressKitId) => {
  const response = await axios.get(`${API_URL}/${pressKitId}/analytics`);
  return response.data;
};

const pressKitService = {
  getAllPressKits,
  getPressKitById,
  getPressKitBySlug,
  createPressKit,
  updatePressKit,
  deletePressKit,
  uploadMedia,
  deleteMedia,
  getPressKitAnalytics,
};

export default pressKitService;