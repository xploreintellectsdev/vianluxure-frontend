import axiosInstance from './axiosInstance';

export const authApi = {
    sendOtp: (data) => axiosInstance.post('/auth/send-otp', data),
    register: (data) => axiosInstance.post('/auth/register', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    googleLogin: (data) => axiosInstance.post('/auth/google', data),
};
