import axiosInstance from './axiosInstance';

export const homeReviewApi = {
  // Public
  getPublic: () => axiosInstance.get(`/home-reviews/public`),

  // Admin - Settings
  getSettings: () => axiosInstance.get(`/home-reviews/settings`),
  updateSettings: (data) => axiosInstance.put(`/home-reviews/settings`, data),

  // Admin - Reviews
  getAll: (viewMode = 'active') => axiosInstance.get(`/home-reviews`, { params: { viewMode } }),
  create: (formData) => axiosInstance.post(`/home-reviews`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  bulkUpload: (formData) => axiosInstance.post(`/home-reviews/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => axiosInstance.put(`/home-reviews/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => axiosInstance.delete(`/home-reviews/${id}`),
  restore: (id) => axiosInstance.put(`/home-reviews/${id}/restore`),
};
