import axiosInstance from './axiosInstance';

export const weightApi = {
    getAll: (params) => axiosInstance.get('/weights', { params }),
    getById: (id) => axiosInstance.get(`/weights/${id}`),
    create: (data) => axiosInstance.post('/weights', data),
    update: (id, data) => axiosInstance.put(`/weights/${id}`, data),
    remove: (id) => axiosInstance.delete(`/weights/${id}`),
};