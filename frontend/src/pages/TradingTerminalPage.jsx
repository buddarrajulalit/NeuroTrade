import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import TradingChart from '../components/TradingChart';
import RSIChart from '../components/RSIChart';
import TradingPanel from '../components/TradingPanel';
import OrderBook from '../components/OrderBook';
import MarketWatchlist from '../components/MarketWatchlist';
import ChartHeader from '../components/ChartHeader';

import {
  SYMBOLS,
  generateCandles,
  generateNextCandle,
  calcSMA,
  calcEMA,
  calcRSI,
  generateAISignals,
  generateOrderBook,
} from '../services/priceStream';

import { FiCpu, FiBook, FiBarChart2, FiGrid, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

// Max history kept per symbol for sparkline
const SPARKLINE_LEN = 30;

// ─── AI Signal Toast ─────────────────────────────────────────────────────────
function SignalToast({ signal, symbol }) {
  const isBuy = signal.type === 'buy';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-semibold ${
      isBuy
        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
        : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
    }`}>
      <RiRobot2Line className="text-lg shrink-0" />
      <div>
        <div className="font-bold text-xs uppercase tracking-wider mb-0.5">
          AI {signal.type} Signal — {symbol}
        </div>
        <div className="text-[11px] font-normal opacity-80">
          Confidence: {(signal.confidence * 100).toFixed(0)}% · ${signal.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ─── Right panel tab ─────────────────────────────────────────────────────────
function RightTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${
        active
          ? 'text-neon-blue border-b-2 border-neon-blue'
          : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
      }`}
    >
      <Icon className="text-sm" />
      {label}
    </button>
  );
}

// ─── Positions strip ─────────────────────────────────────────────────────────
function PositionsStrip({ positions }) {
  if (!positions?.length) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 overflow-x-auto bg-black/20"
      style={{ scrollbarWidth: 'none' }}>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 font-bold">Positions</span>
      {positions.map(p => {
        const up = p.pnl >= 0;
        return (
          <div key={p.symbol}
            className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold font-mono text-slate-200">{p.symbol}</span>
            <span className="text-[10px] text-slate-500">{p.qty} sh</span>
            <span className={`text-[10px] font-bold font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {up ? '+' : ''}${p.pnl.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Indicator legend strip ───────────────────────────────────────────────────
function IndicatorLegend({ smaVal, emaVal }) {
  return (
    <div className="flex items-center gap-4 px-4 py-1 border-b border-white/5 bg-black/20">
      <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Indicators</span>
      <span className="flex items-center gap-1.5 text-[10px] font-mono">
        <span className="w-4 h-px bg-amber-400 inline-block" />
        <span className="text-amber-400">SMA 20</span>
        {smaVal && <span className="text-slate-400">{smaVal.toFixed(2)}</span>}
      </span>
      <span className="flex items-center gap-1.5 text-[10px] font-mono">
        <span className="w-4 h-px bg-violet-400 inline-block" />
        <span className="text-violet-400">EMA 50</span>
        {emaVal && <span className="text-slate-400">{emaVal.toFixed(2)}</span>}
      </span>
      <span className="flex items-center gap-1.5 text-[10px] font-mono ml-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        <span className="text-emerald-400">Buy Signal</span>
      </span>
      <span className="flex items-center gap-1.5 text-[10px] font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
        <span className="text-rose-400">Sell Signal</span>
      </span>
    </div>
  );
}

// ─── Main Terminal Page ───────────────────────────────────────────────────────
export default function TradingTerminalPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [candles, setCandles] = useState([]);
  const [liveCandle, setLiveCandle] = useState(null);
  const [liveData, setLiveData] = useState({});      // { AAPL: { price, change, flash, history } }
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [rightTab, setRightTab] = useState('trade'); // 'trade' | 'orderbook'
  const [interval, setInterval] = useState('1m');
  const [positions, setPositions] = useState([
    { symbol: 'AAPL', qty: 5, entryPrice: 172.30, currentPrice: 178.50, pnl: 31.00, pnlPct: 3.60 },
    { symbol: 'NVDA', qty: 2, entryPrice: 820.00, currentPrice: 875.40, pnl: 110.80, pnlPct: 6.80 },
  ]);
  const [recentTrades, setRecentTrades] = useState([]);

  const streamRef = useRef(null);
  const allCandlesRef = useRef({}); // Cache candles per symbol
  const prevSignalsRef = useRef(new Set());

  // ── Derived indicators ─────────────────────────────────────────────────────
  const smaData = useMemo(() => calcSMA(candles, 20), [candles]);
  const emaData = useMemo(() => calcEMA(candles, 50), [candles]);
  const rsiData = useMemo(() => calcRSI(candles, 14), [candles]);
  const signals = useMemo(() => generateAISignals(candles, smaData, emaData), [candles, smaData, emaData]);

  const currentPrice = candles[candles.length - 1]?.close ?? 0;
  const prevClose = candles[candles.length - 2]?.close;
  const lastSMA = smaData[smaData.length - 1]?.value;
  const lastEMA = emaData[emaData.length - 1]?.value;
  const lastSignal = signals[signals.length - 1];

  const symbolInfo = SYMBOLS.find(s => s.symbol === selectedSymbol) || SYMBOLS[0];

  // ── Load candles when symbol changes ──────────────────────────────────────
  useEffect(() => {
    if (!allCandlesRef.current[selectedSymbol]) {
      allCandlesRef.current[selectedSymbol] = generateCandles(selectedSymbol, 300);
    }
    setCandles(allCandlesRef.current[selectedSymbol]);
    prevSignalsRef.current.clear();
  }, [selectedSymbol]);

  // ── Initialize liveData for all symbols ───────────────────────────────────
  useEffect(() => {
    const init = {};
    SYMBOLS.forEach(sym => {
      const c = allCandlesRef.current[sym.symbol] || generateCandles(sym.symbol, 100);
      allCandlesRef.current[sym.symbol] = c;
      const price = c[c.length - 1]?.close ?? sym.base;
      init[sym.symbol] = {
        price,
        change: 0,
        flash: null,
        history: c.slice(-SPARKLINE_LEN).map(x => x.close),
        basePrice: price,
      };
    });
    setLiveData(init);
  }, []);

  // ── Live streaming interval ────────────────────────────────────────────────
  useEffect(() => {
    if (Object.keys(liveData).length === 0) return;

    streamRef.current = window.setInterval(() => {
      setLiveData(prev => {
        const next = { ...prev };
        SYMBOLS.forEach(sym => {
          const entry = prev[sym.symbol];
          if (!entry) return;

          const cached = allCandlesRef.current[sym.symbol];
          if (!cached || cached.length === 0) return;

          const newCandle = generateNextCandle(cached[cached.length - 1], sym.symbol);
          allCandlesRef.current[sym.symbol] = [...cached, newCandle];

          const oldPrice = entry.price;
          const price = newCandle.close;
          const change = ((price - entry.basePrice) / entry.basePrice) * 100;
          const flash = price > oldPrice ? 'up' : price < oldPrice ? 'down' : null;
          const history = [...(entry.history || []).slice(-(SPARKLINE_LEN - 1)), price];

          next[sym.symbol] = { ...entry, price, change, flash, history };
        });
        return next;
      });

      // Update selected symbol candles + live candle
      setCandles(() => {
        const cached = allCandlesRef.current[selectedSymbol];
        if (!cached) return [];
        const base = cached.slice(0, -1); // all except last (live)
        const live = cached[cached.length - 1];
        setLiveCandle(live);
        return base;
      });

      // Update order book
      setLiveData(prev => {
        const price = prev[selectedSymbol]?.price;
        if (price) {
          const ob = generateOrderBook(price);
          setOrderBook(ob);
        }
        return prev;
      });
    }, 1000);

    return () => window.clearInterval(streamRef.current);
  }, [selectedSymbol, liveData]);

  // ── Emit AI signal toasts ──────────────────────────────────────────────────
  useEffect(() => {
    if (!lastSignal) return;
    const key = `${lastSignal.type}-${lastSignal.time}`;
    if (prevSignalsRef.current.has(key)) return;
    prevSignalsRef.current.add(key);

    toast.custom(
      t => (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <SignalToast signal={lastSignal} symbol={selectedSymbol} />
        </motion.div>
      ),
      { duration: 5000, position: 'bottom-right' }
    );
  }, [lastSignal, selectedSymbol]);

  // ── Handle trade execution ─────────────────────────────────────────────────
  const handleTrade = useCallback((order) => {
    const trade = {
      id: Date.now(),
      ...order,
      time: new Date().toLocaleTimeString(),
    };
    setRecentTrades(prev => [trade, ...prev].slice(0, 20));
    toast.success(`${order.side} ${order.qty} × ${order.symbol} @ $${order.price.toFixed(2)}`, {
      style: {
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '13px',
        fontFamily: 'monospace',
      },
      icon: order.side === 'BUY' ? '📈' : '📉',
    });
  }, []);

  // ── Symbol change ──────────────────────────────────────────────────────────
  const handleSymbolSelect = useCallback((sym) => {
    setSelectedSymbol(sym);
    setLiveCandle(null);
  }, []);

  const spread = orderBook.asks[0]?.price && orderBook.bids[0]?.price
    ? orderBook.asks[0].price - orderBook.bids[0].price
    : null;

  return (
    <div className="flex h-full overflow-hidden"
      style={{ background: '#0b1120', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT: Market Watchlist ──────────────────────────────────────── */}
      <div className="w-52 shrink-0 flex flex-col overflow-hidden border-r border-white/5">
        <MarketWatchlist
          symbols={SYMBOLS}
          liveData={liveData}
          selected={selectedSymbol}
          onSelect={handleSymbolSelect}
        />
      </div>

      {/* ── CENTER: Chart area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Chart header */}
        <ChartHeader
          symbol={selectedSymbol}
          name={symbolInfo.name}
          candles={candles}
          currentPrice={liveData[selectedSymbol]?.price ?? currentPrice}
          prevClose={prevClose}
          interval={interval}
          onIntervalChange={setInterval}
        />

        {/* Indicator legend */}
        <IndicatorLegend smaVal={lastSMA} emaVal={lastEMA} />

        {/* Main chart */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          <TradingChart
            candles={candles}
            liveCandle={liveCandle}
            smaData={smaData}
            emaData={emaData}
            signals={signals}
            symbol={selectedSymbol}
          />

          {/* AI Signal badge overlay */}
          {lastSignal && (
            <motion.div
              key={lastSignal.time}
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold shadow-lg backdrop-blur-sm ${
                lastSignal.type === 'buy'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              }`}
            >
              <RiRobot2Line className="text-sm" />
              AI {lastSignal.type.toUpperCase()} · {(lastSignal.confidence * 100).toFixed(0)}%
            </motion.div>
          )}
        </div>

        {/* RSI sub-chart */}
        <div className="h-28 border-t border-white/5 shrink-0">
          <RSIChart rsiData={rsiData} />
        </div>

        {/* Positions strip */}
        <PositionsStrip positions={positions} />
      </div>

      {/* ── RIGHT: Trade panel + Order book ────────────────────────────── */}
      <div className="w-64 shrink-0 flex flex-col overflow-hidden border-l border-white/5"
        style={{ background: '#0d1629' }}>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0">
          <RightTab icon={FiBarChart2} label="Trade" active={rightTab === 'trade'} onClick={() => setRightTab('trade')} />
          <RightTab icon={FiBook} label="Book" active={rightTab === 'orderbook'} onClick={() => setRightTab('orderbook')} />
          <RightTab icon={FiGrid} label="Signals" active={rightTab === 'signals'} onClick={() => setRightTab('signals')} />
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {rightTab === 'trade' && (
              <motion.div
                key="trade"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-4 h-full"
              >
                <TradingPanel
                  symbol={selectedSymbol}
                  currentPrice={liveData[selectedSymbol]?.price ?? currentPrice}
                  onTrade={handleTrade}
                />
              </motion.div>
            )}

            {rightTab === 'orderbook' && (
              <motion.div
                key="orderbook"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <OrderBook
                  bids={orderBook.bids}
                  asks={orderBook.asks}
                  spread={spread}
                  currentPrice={liveData[selectedSymbol]?.price ?? currentPrice}
                />
              </motion.div>
            )}

            {rightTab === 'signals' && (
              <motion.div
                key="signals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiRobot2Line className="text-neon-purple text-sm" />
                  <span className="text-xs font-bold text-slate-200">AI Signals</span>
                  <span className="ml-auto text-[10px] bg-neon-purple/10 text-neon-purple px-2 py-0.5 rounded-full border border-neon-purple/20">
                    {signals.length} total
                  </span>
                </div>

                {signals.length === 0 && (
                  <div className="text-center py-8">
                    <FiAlertCircle className="text-slate-600 text-2xl mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No signals yet</p>
                  </div>
                )}

                {[...signals].reverse().slice(0, 20).map((sig, i) => (
                  <div key={i}
                    className={`rounded-xl border px-3 py-2.5 ${
                      sig.type === 'buy'
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-rose-500/20 bg-rose-500/5'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${sig.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sig.type === 'buy' ? '▲' : '▼'} {sig.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(sig.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Price: <span className="font-mono text-slate-200">${sig.price.toFixed(2)}</span></span>
                      <span>Conf: <span className="font-mono text-slate-200">{(sig.confidence * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                ))}

                {/* Recent trades */}
                {recentTrades.length > 0 && (
                  <>
                    <div className="h-px bg-white/5 my-2" />
                    <div className="flex items-center gap-2 mb-2">
                      <FiTrendingUp className="text-neon-blue text-xs" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Orders</span>
                    </div>
                    {recentTrades.slice(0, 5).map(t => (
                      <div key={t.id}
                        className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 flex items-center justify-between">
                        <div>
                          <span className={`text-[10px] font-bold ${t.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.side}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            {t.qty}× {t.symbol}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300">${t.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
