import axiosInstance from './axiosInstance';

export const addressApi = {
    getAll: () => axiosInstance.get('/addresses'),
    create: (data) => axiosInstance.post('/addresses', data),
    update: (id, data) => axiosInstance.put(`/addresses/${id}`, data),
    remove: (id) => axiosInstance.delete(`/addresses/${id}`),
};