import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { stockApi } from '../services/api';

const StockContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export function StockProvider({ children }) {
    const [stocks, setStocks] = useState([]);
    const [connected, setConnected] = useState(false);
    const [priceFlash, setPriceFlash] = useState({}); // { AAPL: 'up' | 'down' }
    const clientRef = useRef(null);
    const prevPrices = useRef({});

    // ── Initial REST fetch ──────────────────────────────────────
    useEffect(() => {
        stockApi.getAll()
            .then(({ data }) => {
                setStocks(data);
                const map = {};
                data.forEach(s => { map[s.symbol] = s.currentPrice; });
                prevPrices.current = map;
            })
            .catch(() => {/* backend might not be running – ok */ });
    }, []);

    // ── STOMP WebSocket connection ───────────────────────────────
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe('/topic/stocks', (msg) => {
                    const updates = JSON.parse(msg.body);
                    setStocks(updates);
                    // Compute flash direction
                    const flash = {};
                    updates.forEach(s => {
                        const prev = prevPrices.current[s.symbol];
                        if (prev !== undefined) {
                            if (s.currentPrice > prev) flash[s.symbol] = 'up';
                            else if (s.currentPrice < prev) flash[s.symbol] = 'down';
                        }
                        prevPrices.current[s.symbol] = s.currentPrice;
                    });
                    setPriceFlash(flash);
                    // Clear flash after 500ms
                    setTimeout(() => setPriceFlash({}), 500);
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => { client.deactivate(); };
    }, []);

    const getStock = useCallback(
        (symbol) => stocks.find(s => s.symbol === symbol),
        [stocks]
    );

    return (
        <StockContext.Provider value={{ stocks, connected, priceFlash, getStock }}>
            {children}
        </StockContext.Provider>
    );
}

export const useStocks = () => {
    const ctx = useContext(StockContext);
    if (!ctx) throw new Error('useStocks must be used inside StockProvider');
    return ctx;
};
