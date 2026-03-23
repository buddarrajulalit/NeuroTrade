export default function DashboardCard({ title, icon: Icon, right, children, className = '' }) {
    return (
        <div className={`glass-card p-6 hover-lift ${className}`}>
            {(title || Icon || right) && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon style={{ color: 'var(--accent)' }} />}
                        {title && <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>}
                    </div>
                    {right}
                </div>
            )}
            {children}
        </div>
    );
}
