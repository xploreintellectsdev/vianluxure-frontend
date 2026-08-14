import axiosInstance from './axiosInstance';

export const monogramApi = {
  // Public methods (active items only)
  getPublicPlacements: () => axiosInstance.get('/monogram/placements'),
  getPublicColors: () => axiosInstance.get('/monogram/colors'),
  getPublicFonts: () => axiosInstance.get('/monogram/fonts'),

  // Admin methods
  getAdminPlacements: () => axiosInstance.get('/admin/monogram/placements'),
  createPlacement: (formData) => axiosInstance.post('/admin/monogram/placements', formData),
  updatePlacement: (id, formData) => axiosInstance.put(`/admin/monogram/placements/${id}`, formData),
  deletePlacement: (id) => axiosInstance.delete(`/admin/monogram/placements/${id}`),

  getAdminColors: () => axiosInstance.get('/admin/monogram/colors'),
  createColor: (formData) => axiosInstance.post('/admin/monogram/colors', formData),
  updateColor: (id, formData) => axiosInstance.put(`/admin/monogram/colors/${id}`, formData),
  deleteColor: (id) => axiosInstance.delete(`/admin/monogram/colors/${id}`),

  getAdminFonts: () => axiosInstance.get('/admin/monogram/fonts'),
  createFont: (formData) => axiosInstance.post('/admin/monogram/fonts', formData),
  updateFont: (id, formData) => axiosInstance.put(`/admin/monogram/fonts/${id}`, formData),
  deleteFont: (id) => axiosInstance.delete(`/admin/monogram/fonts/${id}`),
};
