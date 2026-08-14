import axiosInstance from './axiosInstance';

export const fabricCategoryApi = {
  getAll: (params) => axiosInstance.get('/fabric-categories', { params }),
  getById: (id) => axiosInstance.get(`/fabric-categories/${id}`),
  getFabricsBySlug: (slug) => axiosInstance.get(`/fabric-categories/category/${slug}`),
  create: (data) => axiosInstance.post('/fabric-categories', data),
  update: (id, data) => axiosInstance.put(`/fabric-categories/${id}`, data),
  remove: (id) => axiosInstance.delete(`/fabric-categories/${id}`),
};