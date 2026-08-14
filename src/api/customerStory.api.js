import axiosInstance from './axiosInstance';

export const customerStoryApi = {
  // Public & Admin
  getByPage: (pageKey, activeOnly = true, viewMode = 'active') => 
    axiosInstance.get(`/customer-stories/${pageKey}`, { params: { activeOnly, viewMode } }),

  // Admin - Section
  upsertSection: (pageKey, formData) => axiosInstance.post(`/customer-stories/${pageKey}/section`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Admin - Stories
  createStory: (sectionId, data) => axiosInstance.post(`/customer-stories/${sectionId}/stories`, data),
  updateStory: (storyId, data) => axiosInstance.put(`/customer-stories/stories/${storyId}`, data),
  deleteStory: (storyId) => axiosInstance.delete(`/customer-stories/stories/${storyId}`),
  restoreStory: (storyId) => axiosInstance.put(`/customer-stories/stories/${storyId}/restore`),
  reorderStories: (sectionId, data) => axiosInstance.put(`/customer-stories/${sectionId}/stories/reorder`, data),
};
