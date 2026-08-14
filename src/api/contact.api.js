import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api/contact-page`;

// Retrieve auth token for admin endpoints
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const contactApi = {
  // Public endpoints
  getPageData: async () => {
    return axios.get(`${BASE_URL}/page-data`);
  },
  
  getHero: async () => {
    return axios.get(`${BASE_URL}/hero`);
  },
  
  getInfoItems: async (activeOnly = true) => {
    return axios.get(`${BASE_URL}/info-items`, {
      params: { activeOnly }
    });
  },

  submitForm: async (data) => {
    return axios.post(`${BASE_URL}/submissions`, data);
  },

  // Admin endpoints
  updateHero: async (formData) => {
    return axios.put(`${BASE_URL}/hero`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders()
      }
    });
  },

  createInfoItem: async (data) => {
    return axios.post(`${BASE_URL}/info-items`, data, { headers: getAuthHeaders() });
  },

  updateInfoItem: async (id, data) => {
    return axios.put(`${BASE_URL}/info-items/${id}`, data, { headers: getAuthHeaders() });
  },

  deleteInfoItem: async (id) => {
    return axios.delete(`${BASE_URL}/info-items/${id}`, { headers: getAuthHeaders() });
  },

  reorderInfoItems: async (items) => {
    return axios.put(`${BASE_URL}/info-items/reorder`, { items }, { headers: getAuthHeaders() });
  },

  getSubmissions: async (params) => {
    return axios.get(`${BASE_URL}/submissions`, { 
      params,
      headers: getAuthHeaders() 
    });
  },

  markSubmissionRead: async (id) => {
    return axios.put(`${BASE_URL}/submissions/${id}/read`, {}, { headers: getAuthHeaders() });
  },

  deleteSubmission: async (id) => {
    return axios.delete(`${BASE_URL}/submissions/${id}`, { headers: getAuthHeaders() });
  }
};
