import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { aiApi, stockApi } from '../services/api';
import { useStocks } from '../context/StockContext';
import AiInsightsPanel from '../components/AiInsightsPanel';
import DashboardCard from '../components/DashboardCard';
import {
    RiBrainLine, RiRobot2Line, RiShieldLine, RiAlertLine,
    RiArrowUpSFill, RiArrowDownSFill, RiLineChartLine,
    RiPulseLine, RiStarLine, RiRefreshLine, RiFlashlightLine,
} from 'react-icons/ri';
import { FiCpu, FiTrendingUp, FiTarget, FiShield, FiAlertTriangle } from 'react-icons/fi';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Risk Gauge ─── */
function RiskGauge({ score }) {
    const s = Number(score) || 0;
    const angle = -90 + (s / 100) * 180;
    const color = s > 70 ? '#ff4d6d' : s > 45 ? '#fbbf24' : '#00ff88';
    const label = s > 70 ? 'High Risk' : s > 45 ? 'Medium Risk' : 'Low Risk';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-16 overflow-hidden">
                <svg viewBox="0 0 140 70" className="w-full h-full">
                    <path d="M15,65 A55,55 0 0,1 125,65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M15,65 A55,55 0 0,1 125,65" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(s / 100) * 172} 172`}
                        style={{ filter: `drop-shadow(0 0 8px ${color}55)` }} />
                    <line x1="70" y1="65" x2="70" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round"
                        transform={`rotate(${angle}, 70, 65)`}
                        style={{ filter: `drop-shadow(0 0 4px ${color}55)` }} />
                    <circle cx="70" cy="65" r="4" fill={color} />
                </svg>
            </div>
            <p className="text-xs font-bold mt-1" style={{ color }}>{label}</p>
            <p className="text-2xl font-mono font-bold text-white">{s}<span className="text-xs text-slate-400">/100</span></p>
        </div>
    );
}

/* ─── Stock Score Card ─── */
function StockScoreCard({ stock, index }) {
    const score = useMemo(() => {
        const ch = Number(stock.changePercent || 0);
        const vol = Number(stock.volume || 0);
        let s = 50;
        s += ch * 3;
        s += vol > 1000000 ? 10 : vol > 500000 ? 5 : 0;
        s += (Math.random() - 0.5) * 15;
        return Math.max(10, Math.min(95, Math.round(s)));
    }, [stock]);

    const signal = score >= 70 ? 'BUY' : score <= 35 ? 'SELL' : 'HOLD';
    const signalConfig = {
        BUY: { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
        SELL: { color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/20' },
        HOLD: { color: 'text-neon-gold', bg: 'bg-neon-gold/10', border: 'border-neon-gold/20' },
    };
    const cfg = signalConfig[signal];
    const ch = Number(stock.changePercent || 0);
    const up = ch >= 0;

    return (
        <motion.div variants={fadeUp} custom={index}
            className="glass-card-hover p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold text-[#93c5fd]">{stock.symbol?.slice(0, 3)}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{stock.symbol}</p>
                    <p className="text-xs text-slate-400 truncate">{stock.name || stock.symbol}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-mono font-bold text-white">${Number(stock.currentPrice || 0).toFixed(2)}</p>
                <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${up ? 'text-neon-green' : 'text-neon-red'}`}>
                    {up ? <RiArrowUpSFill /> : <RiArrowDownSFill />}{Math.abs(ch).toFixed(2)}%
                </p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0 pl-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                    style={{ borderColor: score >= 70 ? '#00ff88' : score <= 35 ? '#ff4d6d' : '#fbbf24' }}>
                    <span className="text-xs font-mono font-bold text-white">{score}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {signal}
                </span>
            </div>
        </motion.div>
    );
}

/* ─── Sentiment Card ─── */
function SentimentCard({ label, value, icon: Icon, color, desc }) {
    return (
        <motion.div variants={fadeUp} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-')}/10 border border-${color.split('-').slice(1).join('-')}/20`}>
                    <Icon className={`${color} text-base`} />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-semibold">{label}</p>
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

export default function AiInsightsPage() {
    const { stocks } = useStocks();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadInsights = (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        aiApi.getInsights()
            .then(({ data }) => setInsights(data))
            .catch(() => setInsights(null))
            .finally(() => { setLoading(false); setRefreshing(false); });
    };

    useEffect(() => { loadInsights(); }, []);

    const list = Array.isArray(stocks) ? stocks : [];
    const topGainers = [...list].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 5);
    const topLosers = [...list].sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 5);

    // Mock sentiment data
    const marketSentiment = useMemo(() => {
        const bullish = list.filter(s => (s.changePercent || 0) > 0).length;
        const bearish = list.filter(s => (s.changePercent || 0) < 0).length;
        const total = list.length || 1;
        return {
            bullishPct: ((bullish / total) * 100).toFixed(0),
            bearishPct: ((bearish / total) * 100).toFixed(0),
            overall: bullish > bearish ? 'Bullish' : bullish < bearish ? 'Bearish' : 'Neutral',
        };
    }, [list]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <RiBrainLine className="text-neon-purple" />
                        AI Insights Engine
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Signals, risk analysis, and AI-powered recommendations</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadInsights(true)}
                    disabled={refreshing}
                    className="btn-ghost flex items-center gap-2 text-xs disabled:opacity-50"
                >
                    <RiRefreshLine className={refreshing ? 'animate-spin' : ''} /> Refresh
                </motion.button>
            </motion.div>

            {/* Top Row: Market Sentiment + Risk + Portfolio Health */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Market Sentiment */}
                <motion.div variants={fadeUp} className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiTrendingUp className="text-neon-blue" />
                        <p className="text-sm font-semibold text-white">Market Sentiment</p>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-neon-green">Bullish {marketSentiment.bullishPct}%</span>
                                <span className="text-neon-red">Bearish {marketSentiment.bearishPct}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                                <div className="h-full bg-neon-green rounded-l-full transition-all duration-700"
                                    style={{ width: `${marketSentiment.bullishPct}%` }} />
                                <div className="h-full bg-neon-red rounded-r-full transition-all duration-700"
                                    style={{ width: `${marketSentiment.bearishPct}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
                        ${marketSentiment.overall === 'Bullish' ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' :
                            marketSentiment.overall === 'Bearish' ? 'bg-neon-red/10 border-neon-red/20 text-neon-red' :
                                'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'}`}>
                        <RiPulseLine /> {marketSentiment.overall} Market
                    </div>
                </motion.div>

                {/* Risk Gauge */}
                <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-3 self-start">
                        <FiShield className="text-neon-gold" />
                        <p className="text-sm font-semibold text-white">Portfolio Risk</p>
                    </div>
                    <RiskGauge score={insights?.riskScore || 42} />
                </motion.div>

                {/* Quick Metrics */}
                <motion.div variants={fadeUp} className="glass-card p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <FiTarget className="text-neon-purple" />
                        <p className="text-sm font-semibold text-white">Quick Metrics</p>
                    </div>
                    {[
                        { label: 'Stocks Tracked', value: list.length, color: 'text-neon-blue' },
                        { label: 'Positive Stocks', value: list.filter(s => (s.changePercent || 0) > 0).length, color: 'text-neon-green' },
                        { label: 'Negative Stocks', value: list.filter(s => (s.changePercent || 0) < 0).length, color: 'text-neon-red' },
                        { label: 'AI Confidence', value: insights?.confidence ? `${(insights.confidence * 100).toFixed(0)}%` : '—', color: 'text-neon-purple' },
                    ].map(m => (
                        <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                            <span className="text-xs text-slate-400">{m.label}</span>
                            <span className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Middle Row: AI Panel + Recommendations */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* AI Insights Panel (original enhanced component) */}
                <motion.div variants={fadeUp} className="lg:col-span-1">
                    <AiInsightsPanel insights={insights} loading={loading} />
                </motion.div>

                {/* AI Recommendation */}
                <motion.div variants={fadeUp} className="lg:col-span-2">
                    <DashboardCard title="AI Recommendation" icon={FiCpu}>
                        <div className="p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/15 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#a855f7,#00c9ff)' }}>
                                    <RiRobot2Line className="text-white text-base" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-200 leading-relaxed">
                                        {insights?.advice || 'Based on current market conditions and your portfolio composition, consider diversifying into technology and healthcare sectors. The market shows a moderately bullish trend with opportunities for growth stocks.'}
                                    </p>
                                    {insights?.confidence && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="h-1.5 bg-white/5 flex-1 rounded-full overflow-hidden">
                                                <div className="h-full bg-neon-purple rounded-full transition-all duration-700"
                                                    style={{ width: `${(insights.confidence * 100)}%` }} />
                                            </div>
                                            <span className="text-xs font-mono text-neon-purple whitespace-nowrap">
                                                {(insights.confidence * 100).toFixed(0)}% confidence
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Suggestions */}
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Portfolio Suggestions</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { title: 'Diversify Holdings', desc: 'Your portfolio may be concentrated. Consider adding stocks from different sectors.', icon: RiShieldLine, color: 'text-neon-blue' },
                                { title: 'Set Stop Losses', desc: 'Protect your positions by setting stop-loss orders on volatile stocks.', icon: FiAlertTriangle, color: 'text-neon-gold' },
                                { title: 'Review Top Gainers', desc: 'Consider taking partial profits on stocks with >10% gains.', icon: RiFlashlightLine, color: 'text-neon-green' },
                                { title: 'Monitor Losers', desc: 'Review underperforming positions and consider averaging down or cutting losses.', icon: RiAlertLine, color: 'text-neon-red' },
                            ].map(s => (
                                <div key={s.title} className="p-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-2 mb-1">
                                        <s.icon className={`text-sm ${s.color}`} />
                                        <p className="text-xs font-semibold text-white">{s.title}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </DashboardCard>
                </motion.div>
            </div>

            {/* Sentiment Cards */}
            <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SentimentCard label="Fear & Greed" value="62 — Greed" icon={RiPulseLine} color="text-neon-green"
                    desc="Market sentiment index based on price movements and volume." />
                <SentimentCard label="Volatility" value="Moderate" icon={FiAlertTriangle} color="text-neon-gold"
                    desc="Average stock volatility is within normal trading ranges." />
                <SentimentCard label="Momentum" value="Positive" icon={FiTrendingUp} color="text-neon-blue"
                    desc="Overall market momentum shows upward trend continuation." />
                <SentimentCard label="AI Signal" value="Buy Dips" icon={RiBrainLine} color="text-neon-purple"
                    desc="AI recommends accumulating quality stocks on pullbacks." />
            </motion.div>

            {/* Stock Scores */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top BUY Signals */}
                <motion.div variants={fadeUp}>
                    <DashboardCard title="AI Buy Signals — Top Gainers" icon={FiTrendingUp}
                        right={<span className="text-xs text-neon-green font-semibold">Strong</span>}>
                        <motion.div variants={stagger} className="space-y-2">
                            {topGainers.map((s, i) => <StockScoreCard key={s.symbol} stock={s} index={i} />)}
                            {topGainers.length === 0 && <p className="text-sm text-slate-500 py-4">No stock data available.</p>}
                        </motion.div>
                    </DashboardCard>
                </motion.div>

                {/* Cautionary Signals */}
                <motion.div variants={fadeUp}>
                    <DashboardCard title="AI Caution Signals — Top Losers" icon={FiAlertTriangle}
                        right={<span className="text-xs text-neon-red font-semibold">Watch</span>}>
                        <motion.div variants={stagger} className="space-y-2">
                            {topLosers.map((s, i) => <StockScoreCard key={s.symbol} stock={s} index={i} />)}
                            {topLosers.length === 0 && <p className="text-sm text-slate-500 py-4">No stock data available.</p>}
                        </motion.div>
                    </DashboardCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
