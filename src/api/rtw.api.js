import axiosInstance from './axiosInstance';

export const rtwApi = {
    getAll: (params) => axiosInstance.get('/ready-to-wear', { params }),
    getById: (id) => axiosInstance.get(`/ready-to-wear/${id}`),
    create: (data) => axiosInstance.post('/ready-to-wear', data),
    update: (id, data) => axiosInstance.put(`/ready-to-wear/${id}`, data),
    remove: (id) => axiosInstance.delete(`/ready-to-wear/${id}`),
};