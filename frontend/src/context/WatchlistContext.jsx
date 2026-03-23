import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WatchlistContext = createContext(null);

const STORAGE_KEY = 'nt_watchlist';

export function WatchlistProvider({ children }) {
    const [watchlist, setWatchlist] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage whenever watchlist changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = useCallback((symbol) => {
        setWatchlist(prev => {
            if (prev.includes(symbol)) return prev;
            return [...prev, symbol];
        });
    }, []);

    const removeFromWatchlist = useCallback((symbol) => {
        setWatchlist(prev => prev.filter(s => s !== symbol));
    }, []);

    const isWatching = useCallback((symbol) => {
        return watchlist.includes(symbol);
    }, [watchlist]);

    const toggleWatchlist = useCallback((symbol) => {
        setWatchlist(prev => {
            if (prev.includes(symbol)) return prev.filter(s => s !== symbol);
            return [...prev, symbol];
        });
    }, []);

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isWatching, toggleWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
}

export const useWatchlist = () => {
    const ctx = useContext(WatchlistContext);
    if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
    return ctx;
};
