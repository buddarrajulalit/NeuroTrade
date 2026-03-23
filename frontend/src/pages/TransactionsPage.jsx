import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { portfolioApi } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import { FiActivity, FiDownload } from 'react-icons/fi';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function TransactionsPage() {
    const [txns, setTxns] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL | BUY | SELL

    useEffect(() => {
        portfolioApi.getHistory(50)
            .then(({ data }) => setTxns(Array.isArray(data) ? data : (data?.content ?? [])))
            .catch(() => setTxns([]));
    }, []);

    const filtered = filter === 'ALL' ? txns : txns.filter(t => t?.type === filter);

    // Stats
    const totalBuys = txns.filter(t => t?.type === 'BUY').length;
    const totalSells = txns.filter(t => t?.type === 'SELL').length;
    const totalVolume = txns.reduce((acc, t) => acc + Number(t?.totalAmount || 0), 0);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    <FiActivity className="text-neon-blue" />
                    Transactions
                </h1>
                <p className="text-sm text-slate-400 mt-1">Your recent trades and activity</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Trades', val: txns.length, color: 'text-white' },
                    { label: 'Buys', val: totalBuys, color: 'text-neon-green' },
                    { label: 'Sells', val: totalSells, color: 'text-neon-red' },
                    { label: 'Volume', val: `$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: 'text-neon-blue' },
                ].map((s, i) => (
                    <motion.div key={s.label} variants={fadeUp} className="stat-card">
                        <span className="text-xs text-slate-400">{s.label}</span>
                        <p className={`font-mono font-bold text-xl ${s.color}`}>{s.val}</p>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div variants={fadeUp}>
                <DashboardCard title="Trade History" icon={FiActivity} className="overflow-hidden"
                    right={
                        <div className="flex items-center gap-2">
                            {['ALL', 'BUY', 'SELL'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                        filter === f
                                            ? f === 'BUY' ? 'bg-neon-green/15 text-neon-green border border-neon-green/20'
                                            : f === 'SELL' ? 'bg-neon-red/15 text-neon-red border border-neon-red/20'
                                            : 'bg-neon-blue/15 text-neon-blue border border-neon-blue/20'
                                            : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                                    }`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs uppercase tracking-wider text-slate-400">
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 pr-4">Type</th>
                                    <th className="text-left py-3 px-4">Symbol</th>
                                    <th className="text-right py-3 px-4">Qty</th>
                                    <th className="text-right py-3 px-4">Price</th>
                                    <th className="text-right py-3 px-4">Total</th>
                                    <th className="text-right py-3 px-4">Realized P&L</th>
                                    <th className="text-right py-3 pl-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t, idx) => {
                                    const isBuy = t?.type === 'BUY';
                                    const pnl = Number(t?.realizedPnl || 0);
                                    return (
                                        <tr key={t?.id ?? idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className={`py-3 pr-4`}>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isBuy ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'}`}>
                                                    {t?.type ?? '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-100 font-semibold">{t?.stock?.symbol ?? '—'}</td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-200">{t?.quantity ?? 0}</td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-200">${Number(t?.pricePerShare || 0).toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-100">${Number(t?.totalAmount || 0).toFixed(2)}</td>
                                            <td className={`py-3 px-4 text-right font-mono text-xs ${!isBuy ? (pnl >= 0 ? 'text-neon-green' : 'text-neon-red') : 'text-slate-500'}`}>
                                                {isBuy ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                                            </td>
                                            <td className="py-3 pl-4 text-right text-xs text-slate-500 font-mono whitespace-nowrap">
                                                {t?.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500">
                                            No transactions{filter !== 'ALL' ? ` of type ${filter}` : ''} yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
            </motion.div>
        </motion.div>
    );
}
