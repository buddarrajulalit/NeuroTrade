import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardCard from './DashboardCard';
import { FiActivity } from 'react-icons/fi';

export default function PortfolioChart({ data = [] }) {
    return (
        <DashboardCard
            title="Stock Chart"
            icon={FiActivity}
            right={<span className="text-xs text-slate-400">Price movement</span>}
        >
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.9} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.92)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                borderRadius: 12,
                                color: '#e2e8f0',
                                fontSize: 12,
                            }}
                            formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Price']}
                            labelFormatter={() => ''}
                        />
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke="url(#lineGrad)"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </DashboardCard>
    );
}

