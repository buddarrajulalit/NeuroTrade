import axios from 'axios';

// Spring Boot API (Maven backend)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ── Request interceptor: attach JWT ──────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('nt_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('nt_token');
            localStorage.removeItem('nt_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─────────────────── Auth API ─────────────────────────────────
export const authApi = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
};

// ─────────────────── Stock API ───────────────────────────────
export const stockApi = {
    getAll: () => api.get('/api/stocks/public'),
    getAllAuth: () => api.get('/api/stocks'),
    getBySymbol: (symbol) => api.get(`/api/stocks/${symbol}`),
};

// ─────────────────── Portfolio API ───────────────────────────
export const portfolioApi = {
    getSummary: () => api.get('/api/portfolio/summary'),
    getHistory: (limit) => api.get(`/api/portfolio/transactions?limit=${limit || 20}`),
    getAllocation: () => api.get('/api/portfolio/allocation'),
};

// ─────────────────── Trading API ─────────────────────────────
export const tradingApi = {
    execute: (payload) => api.post('/api/trade/execute', payload),
};

// ─────────────────── AI API ──────────────────────────────────
export const aiApi = {
    getInsights: () => api.get('/api/ai/insights'),
    getStockScore: (symbol) => api.get(`/api/ai/score/${symbol}`),
};

// ─────────────────── Watchlist API ───────────────────────
export const watchlistApi = {
    getAll: () => api.get('/api/watchlist'),
    add: (symbol) => api.post('/api/watchlist', { symbol }),
    remove: (symbol) => api.delete(`/api/watchlist/${symbol}`),
};

export default api;
