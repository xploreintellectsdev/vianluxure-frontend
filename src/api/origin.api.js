import axiosInstance from './axiosInstance';

export const originApi = {
    getAll: (params) => axiosInstance.get('/origins', { params }),
    getById: (id) => axiosInstance.get(`/origins/${id}`),
    create: (data) => axiosInstance.post('/origins', data),
    update: (id, data) => axiosInstance.put(`/origins/${id}`, data),
    remove: (id) => axiosInstance.delete(`/origins/${id}`),
};