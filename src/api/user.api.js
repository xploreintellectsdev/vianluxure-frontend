import axiosInstance from './axiosInstance';

export const userApi = {
    sendEmailChangeOtp: (data) => axiosInstance.post('/users/send-email-otp', data),
    updateProfile: (data) => axiosInstance.put('/users/profile', data),
    uploadProfilePic: (formData) => axiosInstance.post('/upload-reference/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};
