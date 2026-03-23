import DashboardCard from './DashboardCard';
import { FiTrendingUp } from 'react-icons/fi';

function fmtNum(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    return v.toLocaleString('en-US');
}

export default function MarketTable({ stocks = [] }) {
    const list = Array.isArray(stocks) ? stocks.slice(0, 12) : [];

    return (
        <DashboardCard title="Market Overview" icon={FiTrendingUp} className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-400">
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 pr-4">Symbol</th>
                            <th className="text-right py-3 px-4">Price</th>
                            <th className="text-right py-3 px-4">Change</th>
                            <th className="text-right py-3 pl-4">Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((s) => {
                            const ch = Number(s?.changePercent || 0);
                            const up = ch >= 0;
                            return (
                                <tr key={s?.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-100 font-mono font-semibold">{s?.symbol ?? '—'}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[180px] hidden sm:block">{s?.name ?? ''}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-100">
                                        ${Number(s?.currentPrice || 0).toFixed(2)}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {up ? '+' : ''}{ch.toFixed(2)}%
                                    </td>
                                    <td className="py-3 pl-4 text-right text-slate-300 font-mono">
                                        {fmtNum(s?.volume)}
                                    </td>
                                </tr>
                            );
                        })}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-slate-500">
                                    No market data yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
}

