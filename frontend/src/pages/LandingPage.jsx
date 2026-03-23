import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    RiRobot2Line, RiLineChartLine, RiShieldCheckLine,
    RiBrainLine, RiArrowRightLine, RiFlashlightLine,
    RiBarChartBoxLine, RiPieChartLine, RiTimeLine,
    RiStarLine, RiCheckboxCircleLine, RiGlobalLine,
    RiTwitterXFill, RiGithubFill, RiLinkedinFill,
} from 'react-icons/ri';
import { useStocks } from '../context/StockContext';

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i = 0) => ({
        opacity: 1, scale: 1,
        transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
    }),
};

/* ─── Floating Particles ─── */
function FloatingParticles() {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-neon-blue/20"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Ticker Bar ─── */
function MarketTickerBar() {
    const { stocks } = useStocks();
    const list = stocks.length > 0 ? stocks : DEMO_TICKERS;
    const doubled = [...list, ...list];

    return (
        <div className="w-full overflow-hidden border-y border-white/5 bg-neural-900/80 backdrop-blur-sm">
            <div className="ticker-track py-3">
                {doubled.map((s, i) => {
                    const ch = Number(s.changePercent || 0);
                    const up = ch >= 0;
                    return (
                        <span key={`${s.symbol}-${i}`}
                            className="inline-flex items-center gap-2 px-6 border-r border-white/5">
                            <span className="text-xs font-mono font-bold text-white">{s.symbol}</span>
                            <span className="text-xs font-mono text-slate-300">${Number(s.currentPrice || s.price || 0).toFixed(2)}</span>
                            <span className={`text-xs font-bold ${up ? 'text-neon-green' : 'text-neon-red'}`}>
                                {up ? '+' : ''}{ch.toFixed(2)}%
                            </span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

const DEMO_TICKERS = [
    { symbol: 'AAPL', currentPrice: 178.50, changePercent: 1.23 },
    { symbol: 'GOOGL', currentPrice: 141.80, changePercent: -0.45 },
    { symbol: 'MSFT', currentPrice: 378.90, changePercent: 0.87 },
    { symbol: 'TSLA', currentPrice: 248.30, changePercent: 2.15 },
    { symbol: 'AMZN', currentPrice: 185.60, changePercent: -1.02 },
    { symbol: 'NVDA', currentPrice: 875.40, changePercent: 3.45 },
    { symbol: 'META', currentPrice: 505.20, changePercent: 1.67 },
    { symbol: 'NFLX', currentPrice: 628.70, changePercent: -0.33 },
];

const features = [
    { icon: RiLineChartLine, title: 'Live Market Simulation', desc: 'Real-time price engine using Geometric Brownian Motion with realistic trend & volatility models.' },
    { icon: RiBrainLine, title: 'AI Market Analyst', desc: 'Rule-based AI analyzing portfolio risk, behavior patterns, sentiment, and market signals in real-time.' },
    { icon: RiShieldCheckLine, title: 'Secure JWT Auth', desc: 'Enterprise-grade Spring Security + JWT with role-based access control and encrypted sessions.' },
    { icon: RiFlashlightLine, title: 'Instant Trade Execution', desc: 'Atomic buy/sell engine with weighted average cost basis, P&L tracking, and instant settlement.' },
    { icon: RiBarChartBoxLine, title: 'Advanced Analytics', desc: 'Portfolio allocation charts, P&L heatmaps, win rate tracking, and performance benchmarking.' },
    { icon: RiPieChartLine, title: 'Portfolio Intelligence', desc: 'Sector-wise allocation, risk scoring, diversification metrics, and AI-driven rebalancing suggestions.' },
];

const howItWorks = [
    { step: '01', title: 'Create Account', desc: 'Sign up in 30 seconds and get $100,000 virtual trading capital instantly.', icon: RiCheckboxCircleLine },
    { step: '02', title: 'Explore Markets', desc: 'Browse real-time simulated stocks across 14+ sectors with live price updates.', icon: RiGlobalLine },
    { step: '03', title: 'Trade & Learn', desc: 'Execute trades, build your portfolio, and learn from AI-powered insights.', icon: RiLineChartLine },
    { step: '04', title: 'Master Trading', desc: 'Track your win rate, risk score, and trader skill metrics as you improve.', icon: RiStarLine },
];

const testimonials = [
    { name: 'Rahul Sharma', role: 'College Student', text: 'NeuroTrade helped me understand market dynamics without any financial risk. The AI insights are incredible!', avatar: 'RS' },
    { name: 'Priya Patel', role: 'Aspiring Trader', text: 'The real-time simulation feels exactly like trading on Zerodha. Best learning platform I\'ve used.', avatar: 'PP' },
    { name: 'Arjun Mehta', role: 'Finance Intern', text: 'Portfolio analytics and P&L tracking taught me more than my entire semester. Highly recommended!', avatar: 'AM' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neural-950 relative overflow-hidden">
            <FloatingParticles />

            {/* Ambient glow blobs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #00c9ff, transparent)' }} />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[150px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #00ff88, transparent)' }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 neural-grid-bg opacity-40 pointer-events-none" />

            {/* ── Navbar ── */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex items-center justify-between px-6 lg:px-10 py-5 border-b border-white/5"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.05 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#00c9ff,#a855f7)' }}
                    >
                        <RiRobot2Line className="text-white text-xl" />
                    </motion.div>
                    <span className="font-bold text-white text-xl tracking-tight">NeuroTrade</span>
                    <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                        BETA
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/market')} className="btn-ghost text-sm hidden sm:inline-flex">
                        View Market
                    </button>
                    <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Login</button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/register')}
                        className="btn-primary text-sm"
                    >
                        Get Started
                    </motion.button>
                </div>
            </motion.nav>

            {/* ── Live Market Ticker ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <MarketTickerBar />
            </motion.div>

            {/* ── Hero ── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 pt-20 md:pt-28 pb-16 text-center"
            >
                <motion.div variants={fadeUp} custom={0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-blue/20 bg-neon-blue/5 text-neon-blue text-xs font-semibold mb-8">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    Live Market Simulation Active
                </motion.div>

                <motion.h1 variants={fadeUp} custom={1}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6">
                    Trade Smarter with{' '}
                    <span className="relative inline-block">
                        <span style={{
                            background: 'linear-gradient(135deg,#00c9ff,#a855f7)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            AI Insights
                        </span>
                        <motion.span
                            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                            style={{ background: 'linear-gradient(90deg,#00c9ff,#a855f7)' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                        />
                    </span>
                </motion.h1>

                <motion.p variants={fadeUp} custom={2}
                    className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                    NeuroTrade is a production-grade virtual stock trading platform powered by a real-time
                    simulation engine and AI market analysis. Trade risk-free. Learn. Win.
                </motion.p>

                <motion.div variants={fadeUp} custom={3}
                    className="flex items-center justify-center gap-4 flex-wrap">
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 8px 40px rgba(0,201,255,0.4)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/register')}
                        className="btn-primary flex items-center gap-2 px-8 py-4 text-base font-bold">
                        Start Trading Free
                        <RiArrowRightLine className="text-lg" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/market')}
                        className="btn-ghost flex items-center gap-2 px-8 py-4 text-base">
                        View Live Market
                    </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={stagger}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
                    {[
                        { val: '15+', label: 'Live Stocks', color: 'neon-text-blue' },
                        { val: '$100K', label: 'Virtual Capital', color: 'neon-text-green' },
                        { val: 'Real-time', label: 'AI Insights', color: 'neon-text-blue' },
                        { val: '14+', label: 'Sectors', color: 'neon-text-green' },
                    ].map(({ val, label, color }) => (
                        <motion.div key={label} variants={scaleIn}
                            className="glass-card p-4 hover:border-neon-blue/20 transition-all duration-300">
                            <p className={`font-black text-2xl ${color} font-mono`}>{val}</p>
                            <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* ── How It Works ── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
                className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-20"
            >
                <motion.div variants={fadeUp} className="text-center mb-14">
                    <span className="text-xs font-bold text-neon-blue tracking-widest uppercase">How It Works</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Start Trading in 4 Simple Steps</h2>
                    <p className="text-slate-400 mt-3 max-w-lg mx-auto">From zero to pro trader in minutes. No real money. No risk. All the learning.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {howItWorks.map(({ step, title, desc, icon: Icon }, i) => (
                        <motion.div key={step} variants={fadeUp} custom={i}
                            className="glass-card-hover p-6 text-center group relative">
                            <div className="absolute -top-3 -right-2 w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-xs font-mono font-bold text-neon-blue">
                                {step}
                            </div>
                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                                style={{ background: 'linear-gradient(135deg, rgba(0,201,255,0.12), rgba(168,85,247,0.12))', border: '1px solid rgba(0,201,255,0.15)' }}>
                                <Icon className="text-neon-blue text-2xl" />
                            </div>
                            <p className="font-semibold text-white text-sm mb-2">{title}</p>
                            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ── Features ── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
                className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-20"
            >
                <motion.div variants={fadeUp} className="text-center mb-14">
                    <span className="text-xs font-bold text-neon-purple tracking-widest uppercase">Features</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                        Built for the Next Generation of Traders
                    </h2>
                    <p className="text-slate-400 mt-3">Professional tools. Zero financial risk.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map(({ icon: Icon, title, desc }, i) => (
                        <motion.div key={title} variants={fadeUp} custom={i}
                            className="glass-card-hover p-6 flex gap-4 group">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                                style={{ background: 'linear-gradient(135deg, rgba(0,201,255,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(0,201,255,0.2)' }}>
                                <Icon className="text-neon-blue text-xl" />
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm mb-1">{title}</p>
                                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ── Testimonials ── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
                className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-20"
            >
                <motion.div variants={fadeUp} className="text-center mb-14">
                    <span className="text-xs font-bold text-neon-green tracking-widest uppercase">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Loved by Traders</h2>
                    <p className="text-slate-400 mt-3">See what our community says about NeuroTrade</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map(({ name, role, text, avatar }, i) => (
                        <motion.div key={name} variants={fadeUp} custom={i}
                            className="glass-card-hover p-6 relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: 'linear-gradient(135deg,#00c9ff,#a855f7)' }}>
                                    {avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{name}</p>
                                    <p className="text-xs text-slate-400">{role}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed italic">"{text}"</p>
                            <div className="flex gap-0.5 mt-4">
                                {[...Array(5)].map((_, j) => (
                                    <RiStarLine key={j} className="text-neon-gold text-sm" />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ── CTA ── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center"
            >
                <motion.div variants={fadeUp}
                    className="glass-card p-10 md:p-14 relative overflow-hidden"
                    style={{ border: '1px solid rgba(0,201,255,0.15)' }}>
                    {/* Glow behind CTA */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at center, #00c9ff, transparent 70%)' }} />
                    <div className="relative z-10">
                        <motion.div variants={fadeUp} custom={0}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20 mb-6">
                            <RiTimeLine /> Limited Time Offer
                        </motion.div>
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to start trading?
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2}
                            className="text-slate-400 mb-8 max-w-md mx-auto">
                            Create your free account and receive $100,000 in virtual capital. No credit card needed.
                        </motion.p>
                        <motion.button
                            variants={fadeUp} custom={3}
                            whileHover={{ scale: 1.04, boxShadow: '0 8px 40px rgba(0,201,255,0.4)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/register')}
                            className="btn-primary flex items-center gap-2 px-10 py-4 text-base font-bold mx-auto">
                            Create Free Account <RiArrowRightLine />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.section>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-white/5 py-10 px-6 lg:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#00c9ff,#a855f7)' }}>
                                    <RiRobot2Line className="text-white text-lg" />
                                </div>
                                <span className="font-bold text-white text-lg">NeuroTrade</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                AI-powered virtual stock trading platform. Learn to trade with zero risk using real-time market simulation and intelligent insights.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform</p>
                            <ul className="space-y-2">
                                {['Dashboard', 'Market', 'Portfolio', 'AI Insights'].map(l => (
                                    <li key={l}><span className="text-sm text-slate-300 hover:text-neon-blue transition-colors cursor-pointer">{l}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resources</p>
                            <ul className="space-y-2">
                                {['Documentation', 'API Reference', 'Support', 'Changelog'].map(l => (
                                    <li key={l}><span className="text-sm text-slate-300 hover:text-neon-blue transition-colors cursor-pointer">{l}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500">© 2024 NeuroTrade. All rights reserved. Built with ❤️ for traders.</p>
                        <div className="flex items-center gap-4">
                            <RiTwitterXFill className="text-slate-400 hover:text-neon-blue transition-colors cursor-pointer" />
                            <RiGithubFill className="text-slate-400 hover:text-neon-blue transition-colors cursor-pointer" />
                            <RiLinkedinFill className="text-slate-400 hover:text-neon-blue transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
