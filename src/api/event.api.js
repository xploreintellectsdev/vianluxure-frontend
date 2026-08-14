import axiosInstance from './axiosInstance';

export const eventApi = {
  getAll: (params) => axiosInstance.get('/events', { params }),
  getById: (id) => axiosInstance.get(`/events/${id}`),
  create: (data) => axiosInstance.post('/events', data),
  update: (id, data) => axiosInstance.put(`/events/${id}`, data),
  remove: (id) => axiosInstance.delete(`/events/${id}`),
};
