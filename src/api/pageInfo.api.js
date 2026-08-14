import axiosInstance from './axiosInstance';

export const pageInfoApi = {
  // Public
  getByPage: (pageKey, activeOnly = true, viewMode = 'active') => 
    axiosInstance.get(`/page-info/${pageKey}`, { params: { activeOnly, viewMode } }),

  // Admin - Sections
  getAllSections: () => axiosInstance.get('/page-info'),
  upsertSection: (pageKey, sectionType, data) => 
    axiosInstance.put(`/page-info/${pageKey}/${sectionType}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Admin - Items
  createItem: (sectionId, data) => axiosInstance.post(`/page-info/${sectionId}/items`, data),
  updateItem: (itemId, data) => axiosInstance.put(`/page-info/items/${itemId}`, data),
  deleteItem: (itemId) => axiosInstance.delete(`/page-info/items/${itemId}`),
  restoreItem: (itemId) => axiosInstance.put(`/page-info/items/${itemId}/restore`),
  reorderItems: (sectionId, data) => axiosInstance.put(`/page-info/${sectionId}/items/reorder`, data),
};
