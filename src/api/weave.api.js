import axiosInstance from './axiosInstance';

export const weaveApi = {
    getAll: (params) => axiosInstance.get('/weaves', { params }),
    getById: (id) => axiosInstance.get(`/weaves/${id}`),
    create: (data) => axiosInstance.post('/weaves', data),
    update: (id, data) => axiosInstance.put(`/weaves/${id}`, data),
    remove: (id) => axiosInstance.delete(`/weaves/${id}`),
};