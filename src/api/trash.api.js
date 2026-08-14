import axiosInstance from './axiosInstance';

export const trashApi = {
  getDeleted: (entity, params) => axiosInstance.get(`/admin/trash/${entity}`, { params }),
  restore: (entity, id) => axiosInstance.post('/admin/restore', { entity, id }),
  permanentDelete: (entity, id) => axiosInstance.delete('/admin/permanent-delete', { data: { entity, id } }),
};
