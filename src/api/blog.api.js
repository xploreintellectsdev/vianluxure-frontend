import axiosInstance from './axiosInstance';

export const blogApi = {
  getAll: (params) => axiosInstance.get('/blogs', { params }),
  getById: (id) => axiosInstance.get(`/blogs/${id}`),
  create: (data) => axiosInstance.post('/blogs', data),
  update: (id, data) => axiosInstance.put(`/blogs/${id}`, data),
  remove: (id) => axiosInstance.delete(`/blogs/${id}`),
};
