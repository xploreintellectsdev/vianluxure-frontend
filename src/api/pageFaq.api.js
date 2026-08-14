import axiosInstance from './axiosInstance';

export const pageFaqApi = {
  // Public
  getByPage: (pageKey, activeOnly = true, viewMode = 'active') => 
    axiosInstance.get(`/page-faq/${pageKey}`, { params: { activeOnly, viewMode } }),

  // Admin - Sections
  getAllSections: () => axiosInstance.get('/page-faq'),
  upsertSection: (pageKey, data) => axiosInstance.put(`/page-faq/${pageKey}`, data),

  // Admin - FAQs
  createFaq: (sectionId, data) => axiosInstance.post(`/page-faq/${sectionId}/faqs`, data),
  updateFaq: (faqId, data) => axiosInstance.put(`/page-faq/faqs/${faqId}`, data),
  deleteFaq: (faqId) => axiosInstance.delete(`/page-faq/faqs/${faqId}`),
  restoreFaq: (faqId) => axiosInstance.put(`/page-faq/faqs/${faqId}/restore`),
  reorderFaqs: (sectionId, data) => axiosInstance.put(`/page-faq/${sectionId}/faqs/reorder`, data),
};
