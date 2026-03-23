import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { portfolioApi } from '../services/api';
import TradeModal from '../components/TradeModal';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    RiArrowUpSFill, RiArrowDownSFill, RiRefreshLine,
    RiBarChartLine, RiExchangeLine, RiPieChartLine
} from 'react-icons/ri';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const PIE_COLORS = ['#00c9ff', '#a855f7', '#00ff88', '#fbbf24', '#ff4d6d', '#06b6d4', '#8b5cf6'];

export default function PortfolioPage() {
    const [summary, setSummary] = useState(null);
    const [alloc, setAlloc] = useState([]);
    const [txns, setTxns] = useState([]);
    const [selected, setSelected] = useState(null);
    const [tab, setTab] = useState('holdings');
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        setRefreshing(true);
        try {
            const [sRes, aRes, tRes] = await Promise.all([
                portfolioApi.getSummary(),
                portfolioApi.getAllocation(),
                portfolioApi.getHistory(50),
            ]);
            setSummary(sRes.data);
            setAlloc(aRes.data);
            setTxns(tRes.data);
        } catch (_) { }
        setRefreshing(false);
    };

    useEffect(() => { load(); }, []);

    const fmt = n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pct = n => `${Number(n || 0).toFixed(2)}%`;
    const holdings = summary?.holdings || [];

    const heatData = holdings.map(h => ({
        symbol: h.symbol,
        pnl: Number(h.pnl),
        pnlPct: Number(h.pnlPercent),
    }));

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <RiPieChartLine className="text-neon-blue" />
                        Portfolio
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{holdings.length} active positions</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={load}
                    disabled={refreshing}
                    className="btn-ghost flex items-center gap-2 text-xs disabled:opacity-50"
                >
                    <RiRefreshLine className={refreshing ? 'animate-spin' : ''} /> Refresh
                </motion.button>
            </motion.div>

            {/* Summary cards */}
            <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Wallet Balance', val: fmt(summary?.walletBalance), color: 'text-white' },
                    { label: 'Market Value', val: fmt(summary?.totalMarketValue), color: 'text-neon-blue' },
                    {
                        label: 'Unrealized P&L', val: fmt(summary?.unrealizedPnl),
                        color: Number(summary?.unrealizedPnl) >= 0 ? 'text-neon-green' : 'text-neon-red',
                        sub: pct(summary?.portfolioGrowthPct)
                    },
                    {
                        label: 'Realized P&L', val: fmt(summary?.realizedPnl),
                        color: Number(summary?.realizedPnl) >= 0 ? 'text-neon-green' : 'text-neon-red',
                        sub: `Win rate: ${pct(summary?.winRate)}`
                    },
                ].map((c, i) => (
                    <motion.div key={c.label} variants={fadeUp} custom={i} className="stat-card">
                        <span className="text-xs text-slate-400">{c.label}</span>
                        <p className={`font-mono font-bold text-xl ${c.color}`}>{c.val}</p>
                        {c.sub && <p className="text-xs text-slate-500">{c.sub}</p>}
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts row */}
            <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-5">
                {/* Sector Allocation */}
                <motion.div variants={fadeUp} className="glass-card p-5">
                    <p className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                        <RiBarChartLine className="text-neon-blue" /> Sector Allocation
                    </p>
                    {alloc.length === 0 ? (
                        <div className="flex items-center justify-center h-44 text-slate-500 text-sm">No data</div>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <ResponsiveContainer width="45%" height={170}>
                                <PieChart>
                                    <Pie data={alloc} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                        paddingAngle={3} dataKey="value" nameKey="sector">
                                        {alloc.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }}
                                        formatter={v => [`$${Number(v).toFixed(0)}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {alloc.slice(0, 6).map((a, i) => (
                                    <div key={a.sector} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-xs text-slate-300 flex-1 truncate">{a.sector}</span>
                                        <span className="text-xs font-mono text-slate-400">{Number(a.percent).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* P&L Heatmap Bar */}
                <motion.div variants={fadeUp} className="glass-card p-5">
                    <p className="font-semibold text-white text-sm mb-4">Position P&L Heatmap</p>
                    {heatData.length === 0 ? (
                        <div className="flex items-center justify-center h-44 text-slate-500 text-sm">No positions</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={170}>
                            <BarChart data={heatData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="symbol" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }}
                                    formatter={v => [`$${Number(v).toFixed(2)}`, 'P&L']}
                                />
                                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                    {heatData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#00ff88' : '#ff4d6d'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </motion.div>

            {/* Tab: Holdings / Transactions */}
            <motion.div variants={fadeUp} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
                    {['holdings', 'transactions'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`text-sm font-semibold capitalize pb-1 transition-all border-b-2 ${tab === t ? 'text-neon-blue border-neon-blue' : 'text-slate-400 border-transparent hover:text-white'
                                }`}>
                            {t === 'holdings' ? `Holdings (${holdings.length})` : `Transactions (${txns.length})`}
                        </button>
                    ))}
                </div>

                {/* Holdings table */}
                {tab === 'holdings' && (
                    holdings.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <RiBarChartLine className="text-4xl mx-auto mb-3 opacity-30" />
                            <p>No holdings yet. Head to the Market to buy stocks.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 text-left border-b border-white/5">
                                        {['Symbol', 'Name', 'Qty', 'Avg Cost', 'Current', 'Total Cost', 'Mkt Value', 'P&L', 'P&L%', 'Action'].map(h => (
                                            <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/3">
                                    {holdings.map(h => {
                                        const up = h.pnl >= 0;
                                        return (
                                            <tr key={h.id} className="hover:bg-white/2 transition-colors">
                                                <td className="py-3 pr-4 font-mono font-bold text-white">{h.symbol}</td>
                                                <td className="py-3 pr-4 text-slate-400 text-xs max-w-[120px] truncate">{h.name}</td>
                                                <td className="py-3 pr-4 font-mono">{h.quantity}</td>
                                                <td className="py-3 pr-4 font-mono text-slate-300">${Number(h.avgCostPrice).toFixed(2)}</td>
                                                <td className="py-3 pr-4 font-mono text-white">${Number(h.currentPrice).toFixed(2)}</td>
                                                <td className="py-3 pr-4 font-mono text-slate-400">${Number(h.totalCost).toFixed(2)}</td>
                                                <td className="py-3 pr-4 font-mono text-neon-blue">${Number(h.marketValue).toFixed(2)}</td>
                                                <td className={`py-3 pr-4 font-mono font-semibold ${up ? 'text-neon-green' : 'text-neon-red'}`}>
                                                    {up ? '+' : ''}{Number(h.pnl).toFixed(2)}
                                                </td>
                                                <td className={`py-3 pr-4 text-xs flex items-center font-semibold ${up ? 'text-neon-green' : 'text-neon-red'}`}>
                                                    {up ? <RiArrowUpSFill /> : <RiArrowDownSFill />}{Math.abs(Number(h.pnlPercent)).toFixed(2)}%
                                                </td>
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => setSelected({
                                                            symbol: h.symbol, name: h.name, sector: h.sector,
                                                            currentPrice: h.currentPrice, changePercent: 0
                                                        })}
                                                        className="btn-ghost text-xs py-1.5 px-3">
                                                        Sell
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* Transactions table */}
                {tab === 'transactions' && (
                    txns.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <RiExchangeLine className="text-4xl mx-auto mb-3 opacity-30" />
                            <p>No transactions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 text-left border-b border-white/5">
                                        {['Type', 'Symbol', 'Qty', 'Price', 'Total', 'Realized P&L', 'Date'].map(h => (
                                            <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/3">
                                    {txns.map(tx => {
                                        const isBuy = tx.type === 'BUY';
                                        const pnl = Number(tx.realizedPnl || 0);
                                        return (
                                            <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBuy ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 font-mono font-bold text-white">{tx.stock?.symbol}</td>
                                                <td className="py-3 pr-4 font-mono">{tx.quantity}</td>
                                                <td className="py-3 pr-4 font-mono text-slate-300">${Number(tx.pricePerShare).toFixed(2)}</td>
                                                <td className="py-3 pr-4 font-mono text-slate-300">${Number(tx.totalAmount).toFixed(2)}</td>
                                                <td className={`py-3 pr-4 font-mono text-xs ${!isBuy ? (pnl >= 0 ? 'text-neon-green' : 'text-neon-red') : 'text-slate-500'}`}>
                                                    {isBuy ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                                                </td>
                                                <td className="py-3 text-xs text-slate-500 font-mono">
                                                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </motion.div>

            {selected && <TradeModal stock={selected} onClose={() => setSelected(null)} onSuccess={load} />}
        </motion.div>
    );
}
