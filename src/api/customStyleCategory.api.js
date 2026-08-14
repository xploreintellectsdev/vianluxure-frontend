import axiosInstance from "./axiosInstance";

export const customStyleCategoryApi = {
  getAll: (params) => axiosInstance.get('/custom-style-categories', { params }),
  create: (data) => axiosInstance.post('/custom-style-categories', data),
  update: (id, data) => axiosInstance.put(`/custom-style-categories/${id}`, data),
  remove: (id) => axiosInstance.delete(`/custom-style-categories/${id}`),
};
