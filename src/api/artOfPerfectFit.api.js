import axios from 'axios';

// Get base URL depending on environment
const getBaseUrl = () => {
    // If we're in the browser and NEXT_PUBLIC_API_URL is set, use it
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    // If we're on the server, we might need a different URL
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }
    // Fallback for local development
    return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

export const artOfPerfectFitAPI = {
    // Public Endpoints
    getArtOfPerfectFit: async () => {
        const response = await axios.get(`${BASE_URL}/art-of-perfect-fit`);
        return response.data;
    },

    // Admin Endpoints
    updateSection: async (title, is_active) => {
        const response = await axios.put(`${BASE_URL}/art-of-perfect-fit/section`, { title, is_active });
        return response.data;
    },

    createStep: async (formData) => {
        const response = await axios.post(`${BASE_URL}/art-of-perfect-fit/steps`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateStep: async (id, formData) => {
        const response = await axios.put(`${BASE_URL}/art-of-perfect-fit/steps/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteStep: async (id) => {
        const response = await axios.delete(`${BASE_URL}/art-of-perfect-fit/steps/${id}`);
        return response.data;
    },

    reorderSteps: async (steps) => {
        const response = await axios.put(`${BASE_URL}/art-of-perfect-fit/steps/reorder`, { steps });
        return response.data;
    }
};
