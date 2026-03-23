import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStocks } from '../context/StockContext';
import { useWatchlist } from '../context/WatchlistContext';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';
import { RiSearchLine, RiFilterLine, RiStarLine, RiGridLine } from 'react-icons/ri';

const SECTORS = ['All', 'Technology', 'Automotive', 'E-Commerce', 'Semiconductors',
    'Social Media', 'Banking', 'Finance', 'Energy', 'Retail',
    'Entertainment', 'Streaming', 'Fintech', 'Crypto'];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };

export default function MarketPage({ guestMode }) {
    const { stocks, priceFlash } = useStocks();
    const { watchlist } = useWatchlist();
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('All');
    const [sort, setSort] = useState('symbol');
    const [selected, setSelected] = useState(null);
    const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

    const filtered = useMemo(() => {
        let list = [...stocks];
        if (showWatchlistOnly) list = list.filter(s => watchlist.includes(s.symbol));
        if (search) list = list.filter(s =>
            s.symbol.includes(search.toUpperCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
        );
        if (sector !== 'All') list = list.filter(s => s.sector === sector);
        list.sort((a, b) => {
            if (sort === 'price') return b.currentPrice - a.currentPrice;
            if (sort === 'change') return b.changePercent - a.changePercent;
            if (sort === 'volume') return (b.volume || 0) - (a.volume || 0);
            return a.symbol.localeCompare(b.symbol);
        });
        return list;
    }, [stocks, search, sector, sort, showWatchlistOnly, watchlist]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <RiGridLine className="text-neon-blue" />
                        Live Market
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {stocks.length} stocks · Prices update every second
                        {guestMode && <span className="ml-2 text-neon-gold font-semibold">· Guest Mode – Login to trade</span>}
                    </p>
                </div>
                {!guestMode && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                        className={`btn-ghost flex items-center gap-2 text-xs transition-all ${
                            showWatchlistOnly ? 'border-neon-gold/30 text-neon-gold bg-neon-gold/5' : ''
                        }`}
                    >
                        <RiStarLine /> {showWatchlistOnly ? 'Show All' : `Watchlist (${watchlist.length})`}
                    </motion.button>
                )}
            </motion.div>

            {/* Filters & Search */}
            <motion.div variants={fadeUp} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search symbol or company…"
                        className="input-field pl-9" />
                </div>
                <div className="flex items-center gap-2">
                    <RiFilterLine className="text-slate-400 text-sm" />
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="input-field w-auto text-sm py-2.5">
                        <option value="symbol">Sort: Symbol</option>
                        <option value="price">Sort: Price</option>
                        <option value="change">Sort: % Change</option>
                        <option value="volume">Sort: Volume</option>
                    </select>
                </div>
            </motion.div>

            {/* Sector pills */}
            <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
                {SECTORS.map(s => (
                    <button key={s} onClick={() => setSector(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${sector === s
                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                                : 'bg-white/4 text-slate-400 border border-white/5 hover:border-white/10 hover:text-white'
                            }`}>
                        {s}
                    </button>
                ))}
            </motion.div>

            {/* Guest banner */}
            {guestMode && (
                <motion.div variants={fadeUp}
                    className="p-4 rounded-xl border border-neon-gold/20 bg-neon-gold/5 flex items-center gap-3">
                    <span className="text-neon-gold text-xl">👁</span>
                    <div>
                        <p className="text-sm font-semibold text-neon-gold">You're in Guest Mode</p>
                        <p className="text-xs text-slate-400">Create a free account to buy and sell stocks with $100,000 virtual cash.</p>
                    </div>
                </motion.div>
            )}

            {/* Stock Grid */}
            {filtered.length === 0 ? (
                <motion.div variants={fadeUp} className="glass-card p-16 text-center">
                    <p className="text-slate-400">{showWatchlistOnly ? 'No stocks in your watchlist' : 'No stocks match your search'}</p>
                </motion.div>
            ) : (
                <motion.div variants={stagger}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((s, i) => (
                        <motion.div key={s.symbol} variants={fadeUp} custom={i}>
                            <StockCard
                                stock={s}
                                flash={priceFlash[s.symbol]}
                                onClick={guestMode ? null : setSelected}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {selected && !guestMode && (
                <TradeModal stock={selected} onClose={() => setSelected(null)} />
            )}
        </motion.div>
    );
}
