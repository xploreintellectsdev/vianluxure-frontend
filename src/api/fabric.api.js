import axiosInstance from './axiosInstance';

export const fabricApi = {
    getAll: (params) => axiosInstance.get('/fabrics', { params }),
    getById: (id) => axiosInstance.get(`/fabrics/${id}`),
    
    // Using FormData for Multi-part (Images + JSON)
    create: (formData) => axiosInstance.post('/fabrics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    update: (id, formData) => axiosInstance.put(`/fabrics/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    remove: (id) => axiosInstance.delete(`/fabrics/${id}`),
    getAvailableForRTW: (params) => axiosInstance.get('/fabrics/available-for-rtw', { params }),
    getNewArrivals: (limit = 10) => axiosInstance.get('/fabrics/new-arrivals', { params: { limit } }),
    getBestSellers: (limit = 10) => axiosInstance.get('/fabrics/best-sellers', { params: { limit } }),
};