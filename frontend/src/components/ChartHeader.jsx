import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';
import { FiClock, FiBarChart2, FiZap } from 'react-icons/fi';

function Stat({ label, value, up, mono = true }) {
  return (
    <div className="flex flex-col items-start min-w-0">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide leading-none mb-0.5">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} text-[12px] font-bold ${up === true ? 'text-emerald-400' : up === false ? 'text-rose-400' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}

export default function ChartHeader({ symbol, name, candles, currentPrice, prevClose, interval, onIntervalChange }) {
  const last = candles[candles.length - 1];
  const open = last?.open ?? 0;
  const high = candles.reduce((m, c) => Math.max(m, c.high), 0);
  const low = candles.reduce((m, c) => Math.min(m, c.low === 0 ? Infinity : c.low), Infinity);
  const change = currentPrice - (prevClose || open);
  const changePct = prevClose ? ((change / prevClose) * 100) : 0;
  const up = change >= 0;

  const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1D'];

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-black/30 flex-wrap overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}>

      {/* Symbol */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center">
          <span className="text-[9px] font-bold font-mono text-neon-blue">{symbol?.slice(0,3)}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 leading-none">{symbol}</p>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">{name}</p>
        </div>
      </div>

      {/* Live price */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xl font-mono font-bold text-slate-100">
          ${currentPrice >= 1000
            ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : currentPrice.toFixed(2)}
        </span>
        <span className={`flex items-center text-sm font-bold font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {up ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
          {Math.abs(changePct).toFixed(2)}%
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-7 bg-white/10 shrink-0 hidden sm:block" />

      {/* OHLC Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <Stat label="Open" value={`$${open.toFixed(2)}`} />
        <Stat label="High" value={`$${high.toFixed(2)}`} up />
        <Stat label="Low" value={`$${(low === Infinity ? 0 : low).toFixed(2)}`} up={false} />
        <Stat label="Change" value={`${up ? '+' : ''}${change.toFixed(2)}`} up={up} />
      </div>

      {/* Divider */}
      <div className="w-px h-7 bg-white/10 shrink-0 hidden md:block" />

      {/* Interval selector */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <FiClock className="text-slate-500 text-xs mr-1" />
        {INTERVALS.map(iv => (
          <button
            key={iv}
            onClick={() => onIntervalChange?.(iv)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all ${
              interval === iv
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {iv}
          </button>
        ))}
      </div>
    </div>
  );
}
