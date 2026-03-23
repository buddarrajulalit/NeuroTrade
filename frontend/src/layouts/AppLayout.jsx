import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStocks } from '../context/StockContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AppLayout({ guestMode }) {
    const { user, logout } = useAuth();
    const { connected } = useStocks();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            {!guestMode && <Sidebar />}

            {/* ── Main area ──────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!guestMode && <Navbar />}

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-5 sm:p-6">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                    {!guestMode && user && (
                        <div className="mt-8 flex items-center justify-between text-xs pt-4"
                            style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
                            <span>Websocket: {connected
                                ? <span className="text-emerald-500 font-semibold">● Live</span>
                                : <span style={{ color: 'var(--text-tertiary)' }}>○ Offline</span>}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn-ghost text-xs py-2"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
