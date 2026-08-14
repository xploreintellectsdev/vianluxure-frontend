import axiosInstance from './axiosInstance';

export const styleApi = {
    getAll: (params) => axiosInstance.get('/styles', { params }),
    getById: (id) => axiosInstance.get(`/styles/${id}`),
    create: (data) => axiosInstance.post('/styles', data),
    update: (id, data) => axiosInstance.put(`/styles/${id}`, data),
    remove: (id) => axiosInstance.delete(`/styles/${id}`),
};