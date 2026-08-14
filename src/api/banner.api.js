import axiosInstance from './axiosInstance';

export const bannerApi = {
  getAllBanners: async (params) => {
    return axiosInstance.get('/banners', { params });
  },

  getBannerById: async (id) => {
    return axiosInstance.get(`/banners/${id}`);
  },

  createBanner: async (payload) => {
    return axiosInstance.post('/banners', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateBanner: async (id, payload) => {
    return axiosInstance.put(`/banners/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteBanner: async (id) => {
    return axiosInstance.delete(`/banners/${id}`);
  }
};
