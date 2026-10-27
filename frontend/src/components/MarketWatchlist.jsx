import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';
import { FiSearch, FiStar } from 'react-icons/fi';
import { useState, useMemo } from 'react';

function PriceBadge({ change }) {
  const up = change >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-bold font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
      {up ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
      {Math.abs(change).toFixed(2)}%
    </span>
  );
}

function MiniSparkline({ history }) {
  if (!history || history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const w = 48, h = 18;
  const pts = history.map((v, i) => [
    (i / (history.length - 1)) * w,
    h - ((v - min) / range) * h,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const up = history[history.length - 1] >= history[0];
  return (
    <svg width={w} height={h} className="shrink-0">
      <path d={d} fill="none" stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function MarketWatchlist({ symbols, liveData, selected, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    symbols.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    ), [symbols, search]);

  return (
    <aside className="flex flex-col h-full overflow-hidden border-r border-white/5"
      style={{ background: 'rgba(15,23,42,0.98)', minWidth: 0 }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <FiStar className="text-neon-gold text-sm" />
          <span className="text-sm font-bold text-slate-100">Watchlist</span>
          <span className="ml-auto text-[10px] bg-neon-blue/15 text-neon-blue px-2 py-0.5 rounded-full border border-neon-blue/20 font-semibold">
            LIVE
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol…"
            className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg bg-black/40 border border-white/10 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-neon-blue/40"
          />
        </div>
      </div>

      {/* Symbol list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {filtered.map((sym, i) => {
            const live = liveData[sym.symbol] || {};
            const price = live.price ?? sym.base;
            const change = live.change ?? 0;
            const history = live.history ?? [];
            const isSelected = selected === sym.symbol;
            const flash = live.flash;

            return (
              <motion.button
                key={sym.symbol}
                layout
                onClick={() => onSelect(sym.symbol)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left transition-all duration-150 group ${
                  isSelected ? 'bg-neon-blue/8' : 'hover:bg-white/4'
                }`}
                style={{
                  borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                }}
              >
                {/* Symbol logo/initial */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold font-mono transition-all ${
                  isSelected ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                }`}>
                  {sym.symbol.slice(0, 3)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-neon-blue' : 'text-slate-200'}`}>
                      {sym.symbol}
                    </span>
                    <PriceBadge change={change} />
                  </div>
                  <div className="flex items-center justify-between mt-0.5 gap-1">
                    <span className="text-[10px] text-slate-500 truncate">{sym.name}</span>
                    <span className={`text-[11px] font-mono font-semibold transition-colors ${
                      flash === 'up' ? 'text-emerald-400' :
                      flash === 'down' ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      ${price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <MiniSparkline history={history} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 text-[10px] text-slate-600 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Real-time simulation · 1s refresh
      </div>
    </aside>
  );
}
