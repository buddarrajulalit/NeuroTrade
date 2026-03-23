import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'trade', title: 'Trade Executed', message: 'BUY 5 × AAPL at $178.50', time: '2 min ago', read: false },
    { id: 2, type: 'alert', title: 'Price Alert', message: 'TSLA is up 3.2% today', time: '15 min ago', read: false },
    { id: 3, type: 'ai', title: 'AI Insight', message: 'New buy signal detected for NVDA', time: '1 hr ago', read: false },
    { id: 4, type: 'system', title: 'Welcome!', message: 'Your account has been credited with $100,000', time: '2 hrs ago', read: true },
    { id: 5, type: 'alert', title: 'Market Update', message: 'Market showing bullish sentiment today', time: '3 hrs ago', read: true },
];

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications(prev => [{
            id: Date.now(),
            time: 'Just now',
            read: false,
            ...notification,
        }, ...prev]);
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, markAsRead, markAllAsRead, addNotification, clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
    return ctx;
};
