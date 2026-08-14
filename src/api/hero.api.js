import axiosInstance from './axiosInstance';

export const heroApi = {
  // Slides
  getAllSlides: (params) => axiosInstance.get('/hero/slides', { params }),
  getSlideById: (id) => axiosInstance.get(`/hero/slides/${id}`),
  createSlide: (data) => axiosInstance.post('/hero/slides', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSlide: (id, data) => axiosInstance.put(`/hero/slides/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSlide: (id) => axiosInstance.delete(`/hero/slides/${id}`),

  // Marquee Items
  getAllMarquee: (params) => axiosInstance.get('/hero/marquee', { params }),
  getMarqueeById: (id) => axiosInstance.get(`/hero/marquee/${id}`),
  createMarquee: (data) => axiosInstance.post('/hero/marquee', data),
  updateMarquee: (id, data) => axiosInstance.put(`/hero/marquee/${id}`, data),
  deleteMarquee: (id) => axiosInstance.delete(`/hero/marquee/${id}`),
};
