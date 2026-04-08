import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const customError = {
            message: error.response?.data?.message || 'Something went wrong',
            details: error.response?.data?.details || {},
            status: error.response?.status
        };
        console.error('API Error:', customError);
        return Promise.reject(customError);
    }
);

export const authService = {
    login: (username, password) => api.post('/auth/login/', { username, password }),
    register: (data) => api.post('/auth/register/', data),
    getProfile: () => api.get('/auth/me/'),
};

export const recordService = {
    getAll: (filters = {}) => api.get('/records/', { params: filters }),
    create: (data) => api.post('/records/', data),
    update: (id, data) => api.put(`/records/${id}/`, data),
    delete: (id) => api.delete(`/records/${id}/`),
};

export const analyticsService = {
    getSummary: () => api.get('/analytics/summary/'),
};

export const userService = {
    getAll: (params = {}) => api.get('/users/', { params }),
    update: (id, data) => api.patch(`/users/${id}/`, data),
    delete: (id) => api.delete(`/users/${id}/`),
};

export default api;
