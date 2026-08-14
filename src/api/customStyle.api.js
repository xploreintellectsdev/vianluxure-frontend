import axiosInstance from './axiosInstance';

export const customStyleApi = {
    // ── FIX: Pass the 'type' (collar, button, etc.) to the backend ──
    getAll: (type, params) => axiosInstance.get('/custom-styles', { params: { ...params, type } }),
    getById: (id) => axiosInstance.get(`/custom-styles/${id}`),
    
    // ── FIX: Pass 'type' as a query parameter so create knows what we are saving! ──
    create: (type, data) => axiosInstance.post(`/custom-styles?type=${type}`, data), 
    
    update: (id, data) => axiosInstance.put(`/custom-styles/${id}`, data),
    remove: (id) => axiosInstance.delete(`/custom-styles/${id}`),
};