// ─── Price Stream Service ─────────────────────────────────────────────────────
// Simulates realistic live OHLCV data for multiple symbols

const SYMBOLS = [
  { symbol: 'AAPL',  name: 'Apple Inc.',        base: 178.50, sector: 'Tech' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',         base: 248.30, sector: 'Auto' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',       base: 875.40, sector: 'Tech' },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',    base: 380.20, sector: 'Tech' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',      base: 141.80, sector: 'Tech' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',    base: 186.50, sector: 'Retail' },
  { symbol: 'META',  name: 'Meta Platforms.',    base: 505.10, sector: 'Tech' },
  { symbol: 'BTC',   name: 'Bitcoin (Mock)',     base: 68000,  sector: 'Crypto' },
  { symbol: 'ETH',   name: 'Ethereum (Mock)',    base: 3400,   sector: 'Crypto' },
  { symbol: 'SPY',   name: 'S&P 500 ETF',        base: 523.50, sector: 'ETF' },
];

// ── Simulate realistic OHLCV generator ──────────────────────────────────────
export function generateCandles(symbol = 'AAPL', count = 200) {
  const info = SYMBOLS.find(s => s.symbol === symbol) || SYMBOLS[0];
  let price = info.base;
  const candles = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 60; // 1 min candles

  for (let i = count - 1; i >= 0; i--) {
    const volatility = price * 0.008;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(open + change, 1);
    const highAdd = Math.abs(Math.random() * volatility * 0.5);
    const lowSub = Math.abs(Math.random() * volatility * 0.5);
    const high = Math.max(open, close) + highAdd;
    const low = Math.min(open, close) - lowSub;
    const volume = Math.floor(Math.random() * 1_000_000 + 500_000);

    candles.push({
      time: now - i * interval,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }

  return candles;
}

// ── Generate next candle from last ──────────────────────────────────────────
export function generateNextCandle(lastCandle, symbol = 'AAPL') {
  const info = SYMBOLS.find(s => s.symbol === symbol) || SYMBOLS[0];
  const volatility = lastCandle.close * 0.006;
  const open = lastCandle.close;
  const change = (Math.random() - 0.47) * volatility;
  const close = Math.max(open + change, 1);
  const highAdd = Math.abs(Math.random() * volatility * 0.4);
  const lowSub = Math.abs(Math.random() * volatility * 0.4);
  const high = Math.max(open, close) + highAdd;
  const low = Math.min(open, close) - lowSub;

  return {
    time: lastCandle.time + 60,
    open: +open.toFixed(2),
    high: +high.toFixed(2),
    low: +low.toFixed(2),
    close: +close.toFixed(2),
    volume: Math.floor(Math.random() * 1_000_000 + 500_000),
  };
}

// ── Technical Indicators ─────────────────────────────────────────────────────

export function calcSMA(candles, period = 20) {
  return candles.map((c, i) => {
    if (i < period - 1) return { time: c.time, value: null };
    const slice = candles.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, x) => sum + x.close, 0) / period;
    return { time: c.time, value: +avg.toFixed(2) };
  }).filter(d => d.value !== null);
}

export function calcEMA(candles, period = 50) {
  const k = 2 / (period + 1);
  const result = [];
  let ema = candles[period - 1]?.close;
  if (!ema) return [];

  candles.forEach((c, i) => {
    if (i < period - 1) return;
    if (i === period - 1) {
      ema = c.close;
    } else {
      ema = c.close * k + ema * (1 - k);
    }
    result.push({ time: c.time, value: +ema.toFixed(2) });
  });

  return result;
}

export function calcRSI(candles, period = 14) {
  if (candles.length < period + 1) return [];
  const gains = [], losses = [];

  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  const result = [];
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsi = (ag, al) => {
    if (al === 0) return 100;
    return +(100 - 100 / (1 + ag / al)).toFixed(2);
  };

  result.push({ time: candles[period].time, value: rsi(avgGain, avgLoss) });

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    result.push({ time: candles[i + 1].time, value: rsi(avgGain, avgLoss) });
  }

  return result;
}

// ── AI Signal Generator ──────────────────────────────────────────────────────
export function generateAISignals(candles, sma, ema) {
  const signals = [];
  const minLen = Math.min(candles.length, sma.length, ema.length);

  for (let i = 20; i < minLen; i++) {
    const c = candles[i];
    const s = sma.find(d => d.time === c.time)?.value;
    const e = ema.find(d => d.time === c.time)?.value;
    if (!s || !e) continue;

    const trendFactor = c.close - (s + e) / 2;
    const strength = Math.abs(trendFactor / c.close);

    if (strength > 0.005 && i % 15 === 0) {
      signals.push({
        type: trendFactor > 0 ? 'buy' : 'sell',
        time: c.time,
        price: c.close,
        confidence: Math.min(0.95, 0.6 + strength * 10),
      });
    }
  }

  return signals;
}

// ── Order Book Simulator ─────────────────────────────────────────────────────
export function generateOrderBook(currentPrice) {
  const bids = [];
  const asks = [];
  let bidPrice = currentPrice * 0.9995;
  let askPrice = currentPrice * 1.0005;

  for (let i = 0; i < 12; i++) {
    const bidSize = +(Math.random() * 5000 + 500).toFixed(0);
    const askSize = +(Math.random() * 5000 + 500).toFixed(0);
    bids.push({ price: +bidPrice.toFixed(2), size: bidSize, total: +(bidSize * bidPrice / 1000).toFixed(1) });
    asks.push({ price: +askPrice.toFixed(2), size: askSize, total: +(askSize * askPrice / 1000).toFixed(1) });
    bidPrice *= 0.9997;
    askPrice *= 1.0003;
  }

  return { bids, asks };
}

// ── Symbols export ───────────────────────────────────────────────────────────
export { SYMBOLS };

// ── Mock portfolio positions ─────────────────────────────────────────────────
export function generatePositions(symbols, candles) {
  return symbols.slice(0, 4).map(sym => {
    const lastCandle = candles[candles.length - 1];
    const entryPrice = lastCandle.close * (0.90 + Math.random() * 0.15);
    const qty = Math.floor(Math.random() * 20 + 1);
    const pnl = (lastCandle.close - entryPrice) * qty;
    return {
      symbol: sym.symbol,
      qty,
      entryPrice: +entryPrice.toFixed(2),
      currentPrice: lastCandle.close,
      pnl: +pnl.toFixed(2),
      pnlPct: +((pnl / (entryPrice * qty)) * 100).toFixed(2),
    };
  });
}
