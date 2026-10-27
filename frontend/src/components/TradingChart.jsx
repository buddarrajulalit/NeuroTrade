import { useEffect, useRef, useCallback } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';

const CHART_THEME = {
  layout: {
    background: { color: '#0f172a' },
    textColor: '#94a3b8',
    fontSize: 11,
    fontFamily: "'Inter', 'JetBrains Mono', monospace",
  },
  grid: {
    vertLines: { color: 'rgba(100,116,139,0.08)', style: LineStyle.Dotted },
    horzLines: { color: 'rgba(100,116,139,0.08)', style: LineStyle.Dotted },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { color: 'rgba(148,163,184,0.3)', labelBackgroundColor: '#1e293b' },
    horzLine: { color: 'rgba(148,163,184,0.3)', labelBackgroundColor: '#1e293b' },
  },
  rightPriceScale: { borderColor: 'rgba(100,116,139,0.15)' },
  timeScale: {
    borderColor: 'rgba(100,116,139,0.15)',
    timeVisible: true,
    secondsVisible: false,
    barSpacing: 6,
  },
};

export default function TradingChart({
  candles = [],
  smaData = [],
  emaData = [],
  signals = [],
  symbol = 'AAPL',
  liveCandle = null,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // ── Initialize chart ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...CHART_THEME,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(100,116,139,0.3)',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volumeSeriesRef.current = volumeSeries;

    // SMA line
    const smaSeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1.5,
      title: 'SMA 20',
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });
    smaSeriesRef.current = smaSeries;

    // EMA line
    const emaSeries = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 1.5,
      title: 'EMA 50',
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });
    emaSeriesRef.current = emaSeries;

    // Resize observer
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // ── Set candle data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;
    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current?.setData(
      candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
      }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // ── Set SMA data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!smaSeriesRef.current || smaData.length === 0) return;
    smaSeriesRef.current.setData(smaData);
  }, [smaData]);

  // ── Set EMA data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!emaSeriesRef.current || emaData.length === 0) return;
    emaSeriesRef.current.setData(emaData);
  }, [emaData]);

  // ── AI Signal Markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || signals.length === 0) return;
    const markers = signals.map(s => ({
      time: s.time,
      position: s.type === 'buy' ? 'belowBar' : 'aboveBar',
      color: s.type === 'buy' ? '#22c55e' : '#ef4444',
      shape: s.type === 'buy' ? 'arrowUp' : 'arrowDown',
      text: `AI ${s.type.toUpperCase()} ${(s.confidence * 100).toFixed(0)}%`,
      size: 1,
    }));
    candleSeriesRef.current.setMarkers(markers);
  }, [signals]);

  // ── Live candle streaming update ─────────────────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || !liveCandle) return;
    candleSeriesRef.current.update(liveCandle);
    volumeSeriesRef.current?.update({
      time: liveCandle.time,
      value: liveCandle.volume,
      color: liveCandle.close >= liveCandle.open ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
    });
  }, [liveCandle]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '420px', background: '#0f172a' }}
    />
  );
}
