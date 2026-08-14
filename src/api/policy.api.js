import axiosInstance from './axiosInstance';

export const policyApi = {
  // Pages
  getAllPages: (params) => axiosInstance.get('/policy-pages', { params }),
  getPageByKey: (pageKey, params) => axiosInstance.get(`/policy-pages/${pageKey}`, { params }),
  createPage: (data) => axiosInstance.post('/policy-pages', data),
  updatePage: (pageId, data) => axiosInstance.put(`/policy-pages/${pageId}`, data),

  // Sections
  getSections: (pageId, params) => axiosInstance.get(`/policy-pages/${pageId}/sections`, { params }),
  createSection: (pageId, data) => axiosInstance.post(`/policy-pages/${pageId}/sections`, data),
  updateSection: (sectionId, data) => axiosInstance.put(`/policy-pages/sections/${sectionId}`, data),
  deleteSection: (sectionId) => axiosInstance.delete(`/policy-pages/sections/${sectionId}`),
  restoreSection: (sectionId) => axiosInstance.put(`/policy-pages/sections/${sectionId}/restore`),
  reorderSections: (pageId, group_name, orderedIds) => axiosInstance.put(`/policy-pages/${pageId}/sections/reorder`, { group_name, orderedIds })
};
