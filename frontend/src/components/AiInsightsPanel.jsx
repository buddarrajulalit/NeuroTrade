import { RiRobot2Line, RiShieldLine, RiLineChartLine, RiAlertLine, RiCheckboxCircleLine } from 'react-icons/ri';

const sentimentConfig = {
    bullish: { label: 'Bullish', color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
    bearish: { label: 'Bearish', color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/20' },
    neutral: { label: 'Neutral', color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20' },
};

const healthConfig = {
    EXCELLENT: { label: 'Excellent', color: 'text-neon-green' },
    GOOD: { label: 'Good', color: 'text-neon-blue' },
    FAIR: { label: 'Fair', color: 'text-neon-gold' },
    POOR: { label: 'Poor', color: 'text-neon-red' },
    EMPTY: { label: 'No Data', color: 'text-slate-400' },
};

function SkillBar({ label, value, color }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`font-mono font-bold ${color}`}>{value}/100</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

export default function AiInsightsPanel({ insights, loading }) {
    if (loading) {
        return (
            <div className="ui-panel animate-pulse-slow">
                <div className="h-4 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
        );
    }
    if (!insights) return null;

    const sentiment = sentimentConfig[insights.sentiment] || sentimentConfig.neutral;
    const health = healthConfig[insights.portfolioHealth] || healthConfig.EMPTY;
    const skill = insights.traderSkill || {};
    const signals = insights.marketSignals || [];

    return (
        <div className="ui-panel space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#00c9ff)' }}>
                    <RiRobot2Line className="text-white text-base" />
                </div>
                <div>
                    <p className="ui-section-title">AI Market Analyst</p>
                    <p className="text-xs text-slate-500">Rule-Based Engine · Model v1</p>
                </div>
                <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${sentiment.bg} ${sentiment.border} ${sentiment.color}`}>
                    {sentiment.label}
                </div>
            </div>

            {/* Advice */}
            <div className="p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/15">
                <p className="text-xs text-slate-300 leading-relaxed">{insights.advice}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 bg-white/5 flex-1 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-purple rounded-full transition-all duration-700"
                            style={{ width: `${(insights.confidence * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-neon-purple">{(insights.confidence * 100).toFixed(0)}% confidence</span>
                </div>
            </div>

            {/* Portfolio Health + Risk */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/3 border border-white/5 text-center">
                    <p className="text-xs text-slate-500 mb-1">Portfolio Health</p>
                    <p className={`font-bold text-sm ${health.color}`}>{health.label}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/3 border border-white/5 text-center">
                    <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                    <p className={`font-bold text-sm ${insights.riskScore > 70 ? 'text-neon-red' : insights.riskScore > 45 ? 'text-neon-gold' : 'text-neon-green'}`}>
                        {insights.riskScore}/100
                    </p>
                </div>
            </div>

            {/* Trader Skill Metrics */}
            <div>
                <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <RiShieldLine /> Trader Skills
                </p>
                <div className="space-y-3">
                    <SkillBar label="Win Rate" value={Math.round(skill.winRate || 0)} color="text-neon-green" />
                    <SkillBar label="Discipline" value={skill.discipline || 0} color="text-neon-blue" />
                    <SkillBar label="Risk Mgmt" value={100 - (insights.riskScore || 0)} color="text-neon-purple" />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                    {skill.profitableTrades || 0}W / {(skill.totalTrades || 0) - (skill.profitableTrades || 0)}L · {skill.totalTrades || 0} trades
                </p>
            </div>

            {/* Market Signals */}
            {signals.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                        <RiLineChartLine /> Market Signals
                    </p>
                    <div className="space-y-1.5">
                        {signals.slice(0, 4).map(sig => (
                            <div key={sig.symbol} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/3 border border-white/5">
                                <span className="text-xs font-mono font-bold text-slate-300">{sig.symbol}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-mono ${sig.pnlPct >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                        {sig.pnlPct >= 0 ? '+' : ''}{sig.pnlPct}%
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sig.signal === 'TAKE_PROFIT' ? 'bg-neon-green/10 text-neon-green' :
                                        sig.signal === 'STOP_LOSS' ? 'bg-neon-red/10   text-neon-red' :
                                            sig.signal === 'ACCUMULATE' ? 'bg-neon-blue/10  text-neon-blue' :
                                                'bg-white/5       text-slate-400'
                                        }`}>
                                        {sig.signal.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
