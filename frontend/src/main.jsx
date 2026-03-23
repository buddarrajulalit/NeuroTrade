window.global = window;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StockProvider } from './context/StockContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <StockProvider>
            <WatchlistProvider>
              <NotificationProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    className: '!bg-[var(--bg-elevated)] !text-[var(--text-primary)] !border !border-[var(--border)] !shadow-lg',
                    style: {
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#00ff88', secondary: 'var(--bg-elevated)' } },
                    error:   { iconTheme: { primary: '#ff4d6d', secondary: 'var(--bg-elevated)' } },
                  }}
                />
              </NotificationProvider>
            </WatchlistProvider>
          </StockProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
