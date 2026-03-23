import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStocks } from '../context/StockContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RiNotification3Line,
    RiCheckDoubleLine,
    RiExchangeLine,
    RiAlarmWarningLine,
    RiRobot2Line,
    RiSettings3Line,
    RiSearchLine,
    RiSunLine,
    RiMoonLine,
} from 'react-icons/ri';

const typeIcon = { trade: RiExchangeLine, alert: RiAlarmWarningLine, ai: RiRobot2Line, system: RiSettings3Line };
const typeColor = { trade: 'text-neon-green', alert: 'text-neon-gold', ai: 'text-neon-purple', system: 'text-neon-blue' };

export default function Navbar() {
    const { user } = useAuth();
    const { stocks } = useStocks();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { isDark, toggleTheme } = useTheme();
    const [showNotifs, setShowNotifs] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Top‑movers ticker */
    const movers = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);

    return (
        <header className="h-14 flex items-center justify-between px-5 border-b"
            style={{
                background: 'var(--navbar-bg)',
                borderColor: 'var(--border)',
                backdropFilter: 'blur(16px) saturate(180%)',
            }}>

            {/* Search */}
            <div className="relative w-64">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                    type="text"
                    placeholder="Search stocks…"
                    className="input-field pl-9 py-2 text-xs !rounded-lg"
                />
            </div>

            {/* Mini ticker */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {movers.map(s => {
                    const up = s.changePercent >= 0;
                    return (
                        <span key={s.symbol} className="flex items-center gap-1">
                            <span style={{ color: 'var(--text-secondary)' }}>{s.symbol}</span>
                            <span className={up ? 'text-neon-green' : 'text-neon-red'}>
                                {up ? '+' : ''}{Number(s.changePercent).toFixed(2)}%
                            </span>
                        </span>
                    );
                })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                        background: 'var(--accent-soft)',
                        border: '1px solid var(--border)',
                        color: 'var(--accent)',
                    }}
                    aria-label="Toggle light/dark mode"
                >
                    <AnimatePresence mode="wait">
                        {isDark ? (
                            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <RiSunLine className="text-base" />
                            </motion.div>
                        ) : (
                            <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <RiMoonLine className="text-base" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Notification bell */}
                <div ref={ref} className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                            background: showNotifs ? 'var(--accent-soft)' : 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <RiNotification3Line className="text-base" />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-red text-[10px] font-bold text-white flex items-center justify-center"
                                style={{ boxShadow: '0 0 8px rgba(255,77,109,0.5)' }}
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </motion.button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {showNotifs && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute right-0 top-12 w-80 glass-card rounded-xl border overflow-hidden z-50"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Notifications {unreadCount > 0 && `(${unreadCount})`}
                                    </span>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-[10px] font-semibold flex items-center gap-1 hover:opacity-70 transition" style={{ color: 'var(--accent)' }}>
                                            <RiCheckDoubleLine /> Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {notifications.slice(0, 5).map((n) => {
                                        const Icon = typeIcon[n.type] || RiSettings3Line;
                                        return (
                                            <motion.div
                                                key={n.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => markAsRead(n.id)}
                                                className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:opacity-80"
                                                style={{
                                                    background: !n.read ? 'var(--accent-soft)' : 'transparent',
                                                    borderColor: 'var(--border)',
                                                }}
                                            >
                                                <Icon className={`text-sm mt-0.5 shrink-0 ${typeColor[n.type]}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                                    <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>{n.message}</p>
                                                </div>
                                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0 mt-1.5" />}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Avatar */}
                {user && (
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #00c9ff, #a855f7)' }}
                    >
                        {(user.displayName || user.username || '?')[0].toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
