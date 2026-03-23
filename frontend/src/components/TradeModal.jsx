import { useState } from 'react';
import { tradingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiCloseLine, RiArrowUpSFill, RiArrowDownSFill, RiLoader4Line } from 'react-icons/ri';

export default function TradeModal({ stock, onClose, onSuccess }) {
    const { updateWallet } = useAuth();
    const [type, setType] = useState('BUY');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!stock) return null;

    const price = Number(stock.currentPrice);
    const total = (price * quantity).toFixed(2);
    const isBuy = type === 'BUY';
    const change = Number(stock.changePercent) || 0;

    const handleTrade = async () => {
        setLoading(true);
        try {
            const { data } = await tradingApi.execute({ symbol: stock.symbol, quantity: Number(quantity), type });
            toast.success(`${type} ${quantity} × ${stock.symbol} @ $${price.toFixed(2)}`);
            if (data.walletBalanceAfter !== undefined) updateWallet(data.walletBalanceAfter);
            onSuccess && onSuccess(data);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Trade failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card w-full max-w-md p-6 relative animate-float"
                style={{ animationDuration: '0s' }}>
                {/* Close */}
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <RiCloseLine className="text-xl" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold font-mono text-white">{stock.symbol}</span>
                        <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-slate-400">{stock.sector}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{stock.name}</p>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-2xl font-mono font-bold text-white">${price.toFixed(2)}</span>
                        <span className={`flex items-center text-sm font-semibold ${change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                            {change >= 0 ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
                            {Math.abs(change).toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Buy / Sell Toggle */}
                <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-lg">
                    {['BUY', 'SELL'].map(t => (
                        <button key={t} onClick={() => setType(t)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all duration-200 ${type === t
                                    ? t === 'BUY' ? 'bg-neon-green text-neural-950' : 'bg-neon-red text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Quantity */}
                <div className="mb-5">
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Quantity</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">−</button>
                        <input type="number" min="1" value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="input-field text-center font-mono font-bold text-lg flex-1" />
                        <button onClick={() => setQuantity(q => q + 1)}
                            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">+</button>
                    </div>
                </div>

                {/* Order summary */}
                <div className="glass-card p-4 mb-5 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Price per share</span>
                        <span className="font-mono text-white">${price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Quantity</span>
                        <span className="font-mono text-white">{quantity}</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 flex justify-between">
                        <span className="text-sm font-semibold text-slate-300">Total {isBuy ? 'Cost' : 'Proceeds'}</span>
                        <span className={`font-mono font-bold text-base ${isBuy ? 'text-neon-red' : 'text-neon-green'}`}>
                            {isBuy ? '-' : '+'}${total}
                        </span>
                    </div>
                </div>

                {/* Submit */}
                <button onClick={handleTrade} disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isBuy ? 'btn-gain' : 'btn-loss'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {loading && <RiLoader4Line className="animate-spin" />}
                    {loading ? 'Executing...' : `${type} ${quantity} Share${quantity > 1 ? 's' : ''}`}
                </button>
            </div>
        </div>
    );
}
