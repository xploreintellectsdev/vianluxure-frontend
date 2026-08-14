import axiosInstance from './axiosInstance';

export const searchApi = {
    getResults: (query) => axiosInstance.get('/search', { params: { q: query } }),
    getFilters: () => axiosInstance.get('/search/filters'),
};