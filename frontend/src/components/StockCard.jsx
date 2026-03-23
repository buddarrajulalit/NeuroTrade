import { RiArrowUpSFill, RiArrowDownSFill, RiStarLine, RiStarFill } from 'react-icons/ri';
import { useWatchlist } from '../context/WatchlistContext';

export default function StockCard({ stock, onClick, flash }) {
    const { isWatching, toggleWatchlist } = useWatchlist();
    const change = Number(stock.changePercent) || 0;
    const isUp = change >= 0;
    const flashClass = flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : '';
    const watching = isWatching(stock.symbol);

    return (
        <div
            className={`glass-card-hover cursor-pointer p-4 relative ${flashClass}`}
            onClick={() => onClick && onClick(stock)}
        >
            {/* Watchlist Star */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                    background: watching ? 'rgba(251,191,36,0.12)' : 'var(--input-bg)',
                    border: `1px solid ${watching ? 'rgba(251,191,36,0.25)' : 'var(--border)'}`,
                    color: watching ? '#fbbf24' : 'var(--text-tertiary)',
                }}
                aria-label={watching ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                {watching ? <RiStarFill className="text-sm" /> : <RiStarLine className="text-sm" />}
            </button>

            <div className="flex items-start justify-between mb-3 pr-8">
                <div>
                    <p className="font-bold text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{stock.symbol}</p>
                    <p className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-tertiary)' }}>{stock.name}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>
                    {stock.sector}
                </span>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="font-mono font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        ${Number(stock.currentPrice).toFixed(2)}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        Vol: {Number(stock.volume || 0).toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`flex items-center gap-0.5 text-sm font-bold ${isUp ? 'text-neon-green' : 'text-neon-red'}`}>
                        {isUp ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
                        {Math.abs(change).toFixed(2)}%
                    </span>
                    <span className={`text-xs font-mono ${isUp ? 'text-neon-green' : 'text-neon-red'}`} style={{ opacity: 0.7 }}>
                        {isUp ? '+' : ''}{Number(stock.change || 0).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Mini bar: day range */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    <span>${Number(stock.dayLow || stock.currentPrice).toFixed(2)}</span>
                    <span style={{ opacity: 0.5 }}>Day range</span>
                    <span>${Number(stock.dayHigh || stock.currentPrice).toFixed(2)}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                    {stock.dayHigh && stock.dayLow && stock.dayHigh !== stock.dayLow && (
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isUp ? 'bg-neon-green' : 'bg-neon-red'}`}
                            style={{
                                width: `${Math.max(5, ((stock.currentPrice - stock.dayLow) / (stock.dayHigh - stock.dayLow)) * 100).toFixed(1)}%`
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
