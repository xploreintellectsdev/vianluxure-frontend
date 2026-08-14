import axiosInstance from './axiosInstance';

export const menuItemApi = {
  getMenuItems: async (params) => {
    return axiosInstance.get('/menu-items', { params });
  },

  createMenuItem: async (payload) => {
    return axiosInstance.post('/menu-items', payload);
  },

  updateMenuItem: async (id, payload) => {
    return axiosInstance.put(`/menu-items/${id}`, payload);
  },

  deleteMenuItem: async (id) => {
    return axiosInstance.delete(`/menu-items/${id}`);
  }
};
