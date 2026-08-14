// api/review.api.js
//
// Uses the shared axiosInstance (baseURL already includes /api, and its
// response interceptor already unwraps response.data and attaches the
// JWT from localStorage) — so every call here returns the parsed body
// directly, and errors already carry a clean .message.
import axiosInstance from "./axiosInstance"; // adjust path to match where axiosInstance actually lives

const RESOURCE = "/reviews";

export const reviewApi = {
  /**
   * GET /api/reviews/:fabricId
   * Returns { success, reviews: [...], summary: {...} }
   */
  async getByFabric(fabricId) {
    return axiosInstance.get(`${RESOURCE}/${fabricId}`);
  },

  /**
   * POST /api/reviews
   * payload: { fab_id, customer_name, customer_email, rating,
   *            review_title, review_text, review_image_url }
   */
  async create(payload) {
    return axiosInstance.post(RESOURCE, payload);
  },

  /**
   * POST /api/reviews/upload
   * Uploads a single image file, returns { success, url }.
   * No need to set Content-Type manually — axiosInstance now infers
   * multipart/form-data from the FormData body automatically.
   */
  async uploadImage(file) {
    const data = new FormData();
    data.append("image", file);
    return axiosInstance.post(`${RESOURCE}/upload`, data);
  },

  /**
   * DELETE /api/reviews/:id
   */
  async remove(id) {
    return axiosInstance.delete(`${RESOURCE}/${id}`);
  },

  /**
   * GET /api/reviews/admin
   */
  async getAllAdminReviews(params) {
    return axiosInstance.get(`${RESOURCE}/admin`, { params });
  },

  /**
   * PUT /api/reviews/:id
   */
  async updateReview(id, data) {
    return axiosInstance.put(`${RESOURCE}/${id}`, data);
  },
};