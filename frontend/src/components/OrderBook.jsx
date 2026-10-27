import { useMemo } from 'react';
import { motion } from 'framer-motion';

function Bar({ pct, type }) {
  return (
    <div className="absolute inset-y-0 right-0 rounded-sm transition-all duration-300 pointer-events-none"
      style={{
        width: `${pct}%`,
        background: type === 'bid'
          ? 'rgba(34,197,94,0.08)'
          : 'rgba(239,68,68,0.08)',
      }}
    />
  );
}

function Row({ price, size, total, type, maxSize }) {
  const pct = Math.min(100, (size / maxSize) * 100);
  return (
    <div className="relative flex items-center justify-between px-3 py-[5px] hover:bg-white/5 transition-colors text-[11px] font-mono cursor-default select-none">
      <Bar pct={pct} type={type} />
      <span className={type === 'bid' ? 'text-emerald-400 z-10' : 'text-rose-400 z-10'}>
        {price.toFixed(2)}
      </span>
      <span className="text-slate-400 z-10">{size.toLocaleString()}</span>
      <span className="text-slate-500 z-10">{total}K</span>
    </div>
  );
}

export default function OrderBook({ bids = [], asks = [], spread, currentPrice }) {
  const maxBidSize = useMemo(() => Math.max(...bids.map(b => b.size), 1), [bids]);
  const maxAskSize = useMemo(() => Math.max(...asks.map(a => a.size), 1), [asks]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-bold text-slate-100">Order Book</span>
        {spread != null && (
          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            Spread: <span className="text-slate-200 font-mono">${spread?.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Column labels */}
      <div className="flex justify-between px-3 py-1.5 text-[10px] text-slate-500 font-medium border-b border-white/5">
        <span>Price (USD)</span>
        <span>Qty</span>
        <span>Total (K)</span>
      </div>

      {/* Asks — reversed (lowest ask at bottom) */}
      <div className="flex-1 overflow-hidden flex flex-col-reverse">
        {asks.slice(0, 8).map((row, i) => (
          <motion.div key={i} layout>
            <Row {...row} type="ask" maxSize={maxAskSize} />
          </motion.div>
        ))}
      </div>

      {/* Spread / mid price */}
      <div className="px-3 py-2 flex items-center justify-center gap-3 border-y border-white/5 bg-black/30">
        <span className="text-base font-bold font-mono text-slate-100">
          ${currentPrice?.toFixed(2) ?? '—'}
        </span>
        <span className="text-[10px] text-slate-500">Market Price</span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 8).map((row, i) => (
          <motion.div key={i} layout>
            <Row {...row} type="bid" maxSize={maxBidSize} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
