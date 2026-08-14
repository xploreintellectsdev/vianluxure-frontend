import axiosInstance from './axiosInstance';

export const colorApi = {
    getAll: (params) => axiosInstance.get('/colors', { params }),
    getById: (id) => axiosInstance.get(`/colors/${id}`),
    create: (data) => axiosInstance.post('/colors', data),
    update: (id, data) => axiosInstance.put(`/colors/${id}`, data),
    remove: (id) => axiosInstance.delete(`/colors/${id}`),
};