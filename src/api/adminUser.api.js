import axiosInstance from './axiosInstance';

export const adminUserApi = {
    getAllUsers: (params) => axiosInstance.get('/admin/users', { params }),
    getUserDetails: (id) => axiosInstance.get(`/admin/users/${id}`),
};
