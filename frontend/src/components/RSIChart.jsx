import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

const RSI_THEME = {
  layout: {
    background: { color: '#0a1120' },
    textColor: '#64748b',
    fontSize: 10,
    fontFamily: "'Inter', monospace",
  },
  grid: {
    vertLines: { color: 'rgba(100,116,139,0.06)' },
    horzLines: { color: 'rgba(100,116,139,0.06)' },
  },
  crosshair: {
    vertLine: { color: 'rgba(148,163,184,0.2)', labelBackgroundColor: '#1e293b' },
    horzLine: { color: 'rgba(148,163,184,0.2)', labelBackgroundColor: '#1e293b' },
  },
  rightPriceScale: {
    borderColor: 'rgba(100,116,139,0.12)',
    scaleMargins: { top: 0.1, bottom: 0.1 },
    entireTextOnly: true,
  },
  timeScale: {
    borderColor: 'rgba(100,116,139,0.12)',
    timeVisible: false,
    visible: false,
  },
};

export default function RSIChart({ rsiData = [] }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...RSI_THEME,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    chartRef.current = chart;

    // RSI line
    const rsiSeries = chart.addLineSeries({
      color: '#a78bfa',
      lineWidth: 1.5,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    rsiSeriesRef.current = rsiSeries;

    // Overbought/oversold bands
    const ob = chart.addLineSeries({
      color: 'rgba(239,68,68,0.4)',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const os = chart.addLineSeries({
      color: 'rgba(34,197,94,0.4)',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Set RSI data — set bands after we have time range
    if (rsiData.length > 0) {
      rsiSeries.setData(rsiData);
      const times = rsiData.map(d => d.time);
      ob.setData(times.map(t => ({ time: t, value: 70 })));
      os.setData(times.map(t => ({ time: t, value: 30 })));
    }

    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // Update RSI data live
  useEffect(() => {
    if (!rsiSeriesRef.current || rsiData.length === 0) return;
    rsiSeriesRef.current.setData(rsiData);
  }, [rsiData]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 flex items-center gap-3 border-b border-white/5">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest">RSI (14)</span>
        <span className="text-[10px] text-rose-400/70">— 70 OVERBOUGHT</span>
        <span className="text-[10px] text-emerald-400/70">— 30 OVERSOLD</span>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}
