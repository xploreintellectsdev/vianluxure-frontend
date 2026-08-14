import axiosInstance from './axiosInstance';

export const corporateOrderApi = {
    create: (data) => axiosInstance.post('/corporate-orders', data),
    getAll: (params) => axiosInstance.get('/corporate-orders', { params }),
    updateStatus: (id, status) => axiosInstance.patch(`/corporate-orders/${id}/status`, { status }),
    remove: (id) => axiosInstance.delete(`/corporate-orders/${id}`)
};
