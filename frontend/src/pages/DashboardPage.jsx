import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStocks } from '../context/StockContext';
import { useWatchlist } from '../context/WatchlistContext';
import { portfolioApi, aiApi } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import MarketTable from '../components/MarketTable';
import PortfolioChart from '../components/PortfolioChart';
import { FiCpu, FiDollarSign, FiPieChart, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

function useAnimatedNumber(value, durationMs = 700) {
    const [display, setDisplay] = useState(0);
    const raf = useRef(0);
    const prev = useRef(0);

    useEffect(() => {
        const to = Number(value) || 0;
        const from = prev.current;
        prev.current = to;

        const start = performance.now();
        cancelAnimationFrame(raf.current);

        const tick = (t) => {
            const p = Math.min(1, (t - start) / durationMs);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(from + (to - from) * eased);
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [value, durationMs]);

    return display;
}

function genSeries(base = 100, len = 48) {
    const data = [];
    let v = Number(base) || 100;
    for (let i = 0; i < len; i++) {
        v = v * (1 + (Math.random() - 0.5) * 0.02);
        data.push({ t: i, v: Number(v.toFixed(2)) });
    }
    return data;
}

/* ─── Activity Feed ─── */
const MOCK_ACTIVITY = [
    { id: 1, type: 'buy', text: 'Bought 5 × AAPL at $178.50', time: '2 min ago' },
    { id: 2, type: 'sell', text: 'Sold 3 × TSLA at $248.30', time: '15 min ago' },
    { id: 3, type: 'insight', text: 'AI detected bullish trend in NVDA', time: '1 hr ago' },
    { id: 4, type: 'alert', text: 'MSFT hit your price target of $380', time: '2 hrs ago' },
    { id: 5, type: 'buy', text: 'Bought 10 × GOOGL at $141.80', time: '3 hrs ago' },
];

export default function DashboardPage() {
    const { stocks } = useStocks();
    const { watchlist } = useWatchlist();
    const [summary, setSummary] = useState(null);
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        let alive = true;
        portfolioApi.getSummary()
            .then(({ data }) => { if (alive) setSummary(data); })
            .catch(() => { if (alive) setSummary(null); });
        aiApi.getInsights()
            .then(({ data }) => { if (alive) setInsights(data); })
            .catch(() => { if (alive) setInsights(null); });
        return () => { alive = false; };
    }, []);

    const total = Number(summary?.totalAssets || summary?.totalMarketValue || 100000);
    const wallet = Number(summary?.walletBalance || 0);
    const pnl = Number(summary?.unrealizedPnl || 0);
    const holdingsCount = Number(summary?.holdingsCount || (Array.isArray(summary?.holdings) ? summary.holdings.length : 0));
    const animatedTotal = useAnimatedNumber(total);

    const chartData = useMemo(() => genSeries(total / 1000, 60), [total]);
    const list = Array.isArray(stocks) ? stocks : [];

    // Watchlist stocks
    const watchlistStocks = useMemo(() => {
        return list.filter(s => watchlist.includes(s.symbol));
    }, [list, watchlist]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* KPI row */}
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <motion.div variants={fadeUp} custom={0}>
                    <DashboardCard title="Portfolio Value" icon={FiDollarSign} className="hover:scale-[1.02]">
                        <p className="text-3xl font-bold text-slate-100 font-mono">
                            ${animatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Cash: ${wallet.toFixed(2)}</p>
                    </DashboardCard>
                </motion.div>

                <motion.div variants={fadeUp} custom={1}>
                    <DashboardCard title="Daily P/L" icon={FiTrendingUp} className="hover:scale-[1.02]">
                        <p className={`text-3xl font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Based on unrealized P&L</p>
                    </DashboardCard>
                </motion.div>

                <motion.div variants={fadeUp} custom={2}>
                    <DashboardCard title="Holdings" icon={FiPieChart} className="hover:scale-[1.02]">
                        <p className="text-3xl font-bold text-slate-100 font-mono">{holdingsCount}</p>
                        <p className="text-xs text-slate-400 mt-2">Stocks owned</p>
                    </DashboardCard>
                </motion.div>

                <motion.div variants={fadeUp} custom={3}>
                    <DashboardCard title="AI Trading Insight" icon={FiCpu} className="hover:scale-[1.02]">
                        <p className="text-sm text-slate-200 leading-relaxed">
                            {insights?.advice || 'AI suggests buying AAPL due to bullish trend.'}
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                            {typeof insights?.confidence === 'number' ? `Confidence: ${(insights.confidence * 100).toFixed(0)}%` : 'Live insights update automatically.'}
                        </p>
                    </DashboardCard>
                </motion.div>
            </motion.div>

            {/* Main trading panel */}
            <div className="grid xl:grid-cols-5 gap-6">
                <motion.div variants={fadeUp} className="xl:col-span-3 space-y-6">
                    <PortfolioChart data={chartData} />
                    <MarketTable stocks={list} />
                </motion.div>

                <motion.div variants={fadeUp} className="xl:col-span-2 space-y-6">
                    {/* Watchlist */}
                    <DashboardCard
                        title="My Watchlist"
                        icon={FiStar}
                        right={<span className="text-xs text-slate-400">{watchlistStocks.length} stocks</span>}
                    >
                        <div className="space-y-2">
                            {watchlistStocks.length > 0 ? (
                                watchlistStocks.map(s => {
                                    const ch = Number(s?.changePercent || 0);
                                    const up = ch >= 0;
                                    return (
                                        <div key={s.symbol} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-white/5 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-neon-gold/10 border border-neon-gold/20 flex items-center justify-center">
                                                    <span className="text-xs font-mono text-neon-gold">{s.symbol?.slice(0, 3)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-100 font-semibold">{s.symbol}</p>
                                                    <p className="text-xs text-slate-500">${Number(s.currentPrice || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {up ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
                                                {Math.abs(ch).toFixed(2)}%
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-6 text-center">
                                    <FiStar className="text-2xl text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No stocks in watchlist</p>
                                    <p className="text-xs text-slate-600 mt-1">Add stocks from the Market page</p>
                                </div>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Quick Watchlist */}
                    <DashboardCard
                        title="Top Movers"
                        icon={FiTrendingUp}
                        right={<span className="text-xs text-slate-400">Today</span>}
                    >
                        <div className="space-y-2">
                            {list
                                .slice()
                                .sort((a, b) => Math.abs((b?.changePercent) || 0) - Math.abs((a?.changePercent) || 0))
                                .slice(0, 5)
                                .map((s) => {
                                    const ch = Number(s?.changePercent || 0);
                                    const up = ch >= 0;
                                    return (
                                        <div key={s?.symbol} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-white/5 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center">
                                                    <span className="text-xs font-mono text-[#93c5fd]">{s?.symbol ?? '—'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-100 font-semibold">{s?.symbol ?? '—'}</p>
                                                    <p className="text-xs text-slate-500">${Number(s?.currentPrice || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {up ? '+' : ''}{ch.toFixed(2)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            {list.length === 0 && (
                                <p className="text-sm text-slate-500">No live data yet.</p>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Activity Feed */}
                    <DashboardCard
                        title="Recent Activity"
                        icon={FiClock}
                        right={<span className="text-xs text-slate-400">Feed</span>}
                    >
                        <div className="space-y-1">
                            {MOCK_ACTIVITY.map(a => (
                                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                        a.type === 'buy' ? 'bg-neon-green' :
                                        a.type === 'sell' ? 'bg-neon-red' :
                                        a.type === 'insight' ? 'bg-neon-purple' :
                                        'bg-neon-gold'
                                    }`} />
                                    <div>
                                        <p className="text-xs text-slate-300">{a.text}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
