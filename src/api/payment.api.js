import axiosInstance from './axiosInstance';

export const paymentApi = {
    // Creates the order server-side and returns a redirectUrl to ICICI's
    // hosted payment page.
    initiate: (data) => axiosInstance.post('/payment/initiate', data),
};
