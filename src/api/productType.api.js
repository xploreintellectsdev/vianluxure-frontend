import axiosInstance from './axiosInstance';

export const productTypeApi = {
    getAll: (params) => axiosInstance.get('/product-types', { params }),
    getById: (id) => axiosInstance.get(`/product-types/${id}`),
    create: (data) => axiosInstance.post('/product-types', data),
    update: (id, data) => axiosInstance.put(`/product-types/${id}`, data),
    remove: (id) => axiosInstance.delete(`/product-types/${id}`),
};