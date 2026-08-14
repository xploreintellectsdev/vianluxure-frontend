import axiosInstance from './axiosInstance';

export const orderApi = {
    // Existing frontend checkout api
    placeOrder: (data) => axiosInstance.post('/orders/checkout', data),
    getUserOrders: () => axiosInstance.get('/orders/my-orders'),
    cancelOrder: (orderId, refundMethod) => axiosInstance.post(`/orders/${orderId}/cancel`, { refundMethod }),
    getOrderDetailsByNumber: (orderNumber) => axiosInstance.get(`/orders/details/${orderNumber}`),
    
    // New Admin Endpoints
    getAllOrders: (params) => axiosInstance.get('/orders', { params }),
    getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
    getOrderStats: () => axiosInstance.get('/orders/stats'),
    updateOrderStatus: (id, status) => axiosInstance.patch(`/orders/${id}/status`, { order_status: status }),

    // Shipping & Courier Endpoints
    createShipment: (orderId, carrier = 'DELHIVERY', weight = 500, dimensions = '10x10x10') => axiosInstance.post('/shipping/create', { orderId, carrier, weight, dimensions }),
    getTracking: (orderId) => axiosInstance.get(`/shipping/track/${orderId}`),
    syncShipment: (orderId) => axiosInstance.post(`/shipping/sync/${orderId}`),
    cancelShipment: (orderId) => axiosInstance.post(`/shipping/cancel/${orderId}`),
};