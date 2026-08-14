import axiosInstance from './axiosInstance';

export const storySectionApi = {
  // Sections
  getAllSections: (params) => axiosInstance.get('/story-sections', { params }),
  getSectionById: (id) => axiosInstance.get(`/story-sections/${id}`),
  createSection: (data) => axiosInstance.post('/story-sections', data),
  updateSection: (id, data) => axiosInstance.put(`/story-sections/${id}`, data),
  deleteSection: (id) => axiosInstance.delete(`/story-sections/${id}`),

  // Cards
  createCard: (sectionId, data) => axiosInstance.post(`/story-sections/${sectionId}/cards`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCard: (cardId, data) => axiosInstance.put(`/story-sections/cards/${cardId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCard: (cardId) => axiosInstance.delete(`/story-sections/cards/${cardId}`),
  reorderCards: (sectionId, data) => axiosInstance.put(`/story-sections/${sectionId}/cards/reorder`, data),

  // Public View
  getAllSectionsWithCards: (params) => axiosInstance.get('/story-sections/with-cards', { params }),
};
