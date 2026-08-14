import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  // Removed the hardcoded 'Content-Type': 'application/json' default.
  // Axios sets this automatically per-request based on the payload:
  // - plain object body → 'application/json' (still works exactly the same)
  // - FormData body → 'multipart/form-data; boundary=...' (this is what was broken)
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (config.baseURL && config.baseURL.includes('localhost')) {
      config.baseURL = config.baseURL.replace('localhost', window.location.hostname);
    }
    const token = sessionStorage.getItem('vian_auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Axios making request to:', config.baseURL, config.url, config.params);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    error.message = message;
    return Promise.reject(error);
  }
);

export default axiosInstance;