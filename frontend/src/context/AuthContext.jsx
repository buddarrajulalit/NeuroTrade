import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('nt_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); }
            catch { localStorage.removeItem('nt_user'); }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const { data } = await authApi.login(credentials);
        localStorage.setItem('nt_token', data.accessToken);
        localStorage.setItem('nt_user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const { data } = await authApi.register(formData);
        localStorage.setItem('nt_token', data.accessToken);
        localStorage.setItem('nt_user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('nt_token');
        localStorage.removeItem('nt_user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateWallet = (newBalance) => {
        setUser(prev => {
            const updated = { ...prev, walletBalance: newBalance };
            localStorage.setItem('nt_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateWallet }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
