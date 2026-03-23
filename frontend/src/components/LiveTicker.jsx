import { useStocks } from '../context/StockContext';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';

function TickerItem({ stock }) {
    const change = Number(stock.changePercent) || 0;
    const isUp = change >= 0;
    const priceStr = Number(stock.currentPrice).toFixed(2);
    const changeStr = `${isUp ? '+' : ''}${change.toFixed(2)}%`;

    return (
        <div className="flex items-center gap-2 px-6 border-r border-white/5 whitespace-nowrap">
            <span className="text-xs font-semibold text-slate-300 font-mono">{stock.symbol}</span>
            <span className="text-xs font-mono text-white">${priceStr}</span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-neon-green' : 'text-neon-red'}`}>
                {isUp ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
                {changeStr}
            </span>
        </div>
    );
}

export default function LiveTicker() {
    const { stocks } = useStocks();
    if (!stocks.length) return null;

    // duplicate for seamless loop
    const items = [...stocks, ...stocks];

    return (
        <div className="ticker-wrap h-9 bg-neural-900 border-b border-white/5 flex items-center">
            <div className="px-3 h-full flex items-center border-r border-white/10 shrink-0">
                <span className="text-xs font-bold text-neon-blue tracking-widest">LIVE</span>
            </div>
            <div className="ticker-track">
                {items.map((s, i) => <TickerItem key={`${s.symbol}-${i}`} stock={s} />)}
            </div>
        </div>
    );
}
