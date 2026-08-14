import axiosInstance from './axiosInstance';

export const patternApi = {
    getAll: (params) => axiosInstance.get('/patterns', { params }),
    getById: (id) => axiosInstance.get(`/patterns/${id}`),
    create: (data) => axiosInstance.post('/patterns', data),
    update: (id, data) => axiosInstance.put(`/patterns/${id}`, data),
    remove: (id) => axiosInstance.delete(`/patterns/${id}`),
};