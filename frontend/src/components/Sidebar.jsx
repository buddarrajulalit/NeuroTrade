import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiPieChart, FiCpu, FiActivity, FiSettings, FiStar } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useWatchlist } from '../context/WatchlistContext';
import { useTheme } from '../context/ThemeContext';

const items = [
    { to: '/app/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/app/market', label: 'Market', icon: FiTrendingUp },
    { to: '/app/portfolio', label: 'Portfolio', icon: FiPieChart },
    { to: '/app/ai-insights', label: 'AI Insights', icon: FiCpu },
    { to: '/app/transactions', label: 'Transactions', icon: FiActivity },
    { to: '/app/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
    const { watchlist } = useWatchlist();
    const { isDark } = useTheme();

    return (
        <aside className="hidden md:flex md:w-72 flex-col border-r"
            style={{
                background: 'var(--sidebar-bg)',
                borderColor: 'var(--border)',
                backdropFilter: 'blur(20px) saturate(180%)',
            }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#00c9ff,#a855f7)' }}>
                        <RiRobot2Line className="text-white text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>NeuroTrade</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AI Trading Platform</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => [
                            'group flex items-center gap-3 px-4 py-3 rounded-xl',
                            'text-sm font-medium transition-all duration-200',
                            isActive
                                ? 'shadow-sm'
                                : 'hover:opacity-80',
                        ].join(' ')}
                        style={({ isActive }) => ({
                            background: isActive ? 'var(--accent-soft)' : 'transparent',
                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                            border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                        })}
                    >
                        <Icon className="text-lg transition-colors" style={{ color: 'inherit' }} />
                        <span className="truncate">{label}</span>
                        {label === 'AI Insights' && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neon-purple/15 text-neon-purple border border-neon-purple/20">
                                AI
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Watchlist Summary */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <FiStar className="text-neon-gold text-sm" />
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Watchlist</p>
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neon-gold/10 text-neon-gold border border-neon-gold/20">
                            {watchlist.length}
                        </span>
                    </div>
                    {watchlist.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {watchlist.slice(0, 6).map(s => (
                                <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                                    style={{ color: 'var(--text-tertiary)', background: 'var(--accent-soft)' }}>
                                    {s}
                                </span>
                            ))}
                            {watchlist.length > 6 && (
                                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>+{watchlist.length - 6} more</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                            Star stocks in the Market to track them here.
                        </p>
                    )}
                </div>
            </div>
        </aside>
    );
}
