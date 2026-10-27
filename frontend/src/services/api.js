import axios from 'axios';

/**
 * Resolve the API base URL with strict production validation.
 * In production (import.meta.env.PROD), VITE_API_BASE_URL MUST be explicitly configured.
 * Local development falls back to 'http://localhost:8080' or a relative path if proxying.
 */
function resolveApiBaseUrl() {
    const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (raw && typeof raw === 'string' && raw.trim().length > 0) {
        return raw.trim().replace(/\/+$/, '');
    }

    if (import.meta.env.PROD) {
        // Do NOT silently fall back to localhost in production.
        // Returning empty string means Axios will use window.location.origin (the Vercel frontend),
        // which avoids cross-origin calls to the user's localhost machine.
        return '';
    }

    return 'http://localhost:8080';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const isBackendConfigured = () => {
    if (import.meta.env.DEV) return true;
    return Boolean(API_BASE_URL && !API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('127.0.0.1'));
};

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('nt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 & normalize errors ────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                localStorage.removeItem('nt_token');
                localStorage.removeItem('nt_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Format an error object into a clean, actionable user-facing message.
 */
export function formatApiError(err, fallback = 'Request failed') {
    if (!err) return fallback;

    if (!isBackendConfigured() && import.meta.env.PROD) {
        return 'Backend API URL is not configured. Please set VITE_API_BASE_URL in your Vercel Project Settings.';
    }

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        return 'Server request timed out. Please verify that the backend is awake and reachable.';
    }

    if (!err.response) {
        if (err.message === 'Network Error') {
            return `Cannot connect to the server at ${API_BASE_URL || 'production backend'}. Please verify backend health and CORS configuration.`;
        }
        return err.message || fallback;
    }

    const data = err.response.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message && typeof data.message === 'string') return data.message;
    if (data?.error && typeof data.error === 'string') return data.error;

    return `${fallback} (HTTP ${err.response.status})`;
}

// ─────────────────── Auth API ───────────────────────────────────
export const authApi = {
    register: (data) => api.post('/api/auth/register', data),
    login:    (data) => api.post('/api/auth/login', data),
};

// ─────────────────── Stock API ──────────────────────────────────
export const stockApi = {
    getAll:       () => api.get('/api/stocks/public'),
    getAllAuth:   () => api.get('/api/stocks'),
    getBySymbol:  (symbol) => api.get(`/api/stocks/${symbol}`),
};

// ─────────────────── Portfolio API ──────────────────────────────
export const portfolioApi = {
    getSummary:     () => api.get('/api/portfolio/summary'),
    getHistory:     (limit) => api.get(`/api/portfolio/transactions?limit=${limit || 20}`),
    getAllocation:  () => api.get('/api/portfolio/allocation'),
};

// ─────────────────── Trading API ────────────────────────────────
export const tradingApi = {
    execute: (payload) => api.post('/api/trade/execute', payload),
};

// ─────────────────── AI API ─────────────────────────────────────
export const aiApi = {
    getInsights:   () => api.get('/api/ai/insights'),
    getStockScore: (symbol) => api.get(`/api/ai/score/${symbol}`),
};

// ─────────────────── Watchlist API ──────────────────────────────
export const watchlistApi = {
    getAll:  () => api.get('/api/watchlist'),
    add:     (symbol) => api.post('/api/watchlist', { symbol }),
    remove:  (symbol) => api.delete(`/api/watchlist/${symbol}`),
};

export default api;
