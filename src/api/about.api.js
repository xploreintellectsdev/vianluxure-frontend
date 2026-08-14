import axiosInstance from './axiosInstance';

export const aboutApi = {
  // Aggregate
  getAllSectionsWithItems: (params) => axiosInstance.get('/about-page/with-items', { params }),

  // Sections
  getSections: (params) => axiosInstance.get('/about-page', { params }),
  getSectionById: (id) => axiosInstance.get(`/about-page/${id}`),
  createSection: (formData) => axiosInstance.post('/about-page', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSection: (id, formData) => axiosInstance.put(`/about-page/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSection: (id) => axiosInstance.delete(`/about-page/${id}`),

  // Items
  getItemsBySectionId: (sectionId, params) => axiosInstance.get(`/about-page/${sectionId}/items`, { params }),
  createItem: (sectionId, formData) => axiosInstance.post(`/about-page/${sectionId}/items`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (itemId, formData) => axiosInstance.put(`/about-page/items/${itemId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteItem: (itemId) => axiosInstance.delete(`/about-page/items/${itemId}`),
  reorderItems: (sectionId, itemOrders) => axiosInstance.put(`/about-page/${sectionId}/items/reorder`, { itemOrders }),

  // Bulk Upload
  bulkUploadItems: (sectionId, formData) => axiosInstance.post(`/about-page/${sectionId}/items/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
