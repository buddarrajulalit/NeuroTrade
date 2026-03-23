import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
    RiUser3Line,
    RiShieldKeyholeLine,
    RiIdCardLine,
    RiNotification3Line,
    RiSave3Line,
    RiUploadCloud2Line,
    RiCheckLine,
} from 'react-icons/ri';

function Row({ label, children, hint }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 first:border-t-0" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>{hint}</p>}
            </div>
            <div className="sm:col-span-2">
                {children}
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between w-full ui-surface px-4 py-3"
        >
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span
                className="w-11 h-6 rounded-full p-1 transition-colors"
                style={{ background: checked ? 'rgba(0,201,255,0.35)' : 'var(--input-bg)', border: '1px solid var(--border)' }}
                aria-checked={checked}
                role="switch"
            >
                <span className={`block w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                    style={{ background: checked ? '#00c9ff' : 'var(--text-tertiary)' }} />
            </span>
        </button>
    );
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const initialProfile = useMemo(() => ({
        displayName: user?.displayName || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: '',
        country: 'India',
    }), [user]);

    const [profile, setProfile] = useState(initialProfile);
    const [kyc, setKyc] = useState({ status: 'NOT_SUBMITTED', idType: 'Aadhaar', idNumber: '' });
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [prefs, setPrefs] = useState({ emailAlerts: true, priceAlerts: true });

    const saveProfile = () => {
        toast.success('Saved locally (backend update not wired yet).');
    };

    const submitKyc = () => {
        if (!kyc.idNumber.trim()) {
            toast.error('Please enter your ID number.');
            return;
        }
        setKyc(prev => ({ ...prev, status: 'PENDING' }));
        toast.success('KYC submitted (mock). Status: Pending verification');
    };

    const changePassword = () => {
        if (security.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (security.newPassword !== security.confirmNewPassword) {
            toast.error('New password and Confirm password do not match');
            return;
        }
        toast.success('Password change (mock). Backend endpoint not added yet.');
        setSecurity({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    };

    const kycBadge = (() => {
        if (kyc.status === 'VERIFIED') return { text: 'Verified', cls: 'ui-chip bg-neon-green/10 border-neon-green/25 text-neon-green' };
        if (kyc.status === 'PENDING') return { text: 'Pending', cls: 'ui-chip bg-neon-gold/10 border-neon-gold/25 text-neon-gold' };
        return { text: 'Not submitted', cls: 'ui-chip' };
    })();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 text-sm mt-1">Profile, KYC, security and preferences</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={kycBadge.cls}>
                        <RiCheckLine className="text-sm" />
                        {kycBadge.text}
                    </span>
                </div>
            </div>

            {/* Profile */}
            <div className="ui-panel">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                        <RiUser3Line className="text-white" />
                    </div>
                    <div>
                        <p className="ui-section-title">Profile details</p>
                        <p className="ui-section-subtitle mt-0.5">Basic information used across the app</p>
                    </div>
                </div>

                <Row label="Display name" hint="Shown on dashboard and sidebar.">
                    <input
                        className="ui-input"
                        value={profile.displayName}
                        onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                        placeholder="Your name"
                    />
                </Row>

                <Row label="Username" hint="This is your login ID.">
                    <input className="ui-input opacity-80" value={profile.username} disabled />
                </Row>

                <Row label="Email" hint="Used for account recovery & alerts.">
                    <input className="ui-input opacity-80" value={profile.email} disabled />
                </Row>

                <Row label="Phone" hint="Optional (for KYC/alerts).">
                    <input
                        className="ui-input"
                        value={profile.phone}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX"
                    />
                </Row>

                <Row label="Country">
                    <select
                        className="ui-input"
                        value={profile.country}
                        onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))}
                    >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                    </select>
                </Row>

                <div className="pt-4">
                    <button type="button" className="ui-button-primary" onClick={saveProfile}>
                        <RiSave3Line /> Save profile
                    </button>
                </div>
            </div>

            {/* KYC */}
            <div className="ui-panel">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                        <RiIdCardLine className="text-white" />
                    </div>
                    <div>
                        <p className="ui-section-title">KYC verification</p>
                        <p className="ui-section-subtitle mt-0.5">Required for deposits/withdrawals (mock UI)</p>
                    </div>
                    <div className="ml-auto">
                        <span className={kycBadge.cls}>{kycBadge.text}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="ui-surface p-4">
                        <p className="text-xs text-slate-400 font-semibold">ID Type</p>
                        <select
                            className="ui-input mt-2"
                            value={kyc.idType}
                            onChange={(e) => setKyc(k => ({ ...k, idType: e.target.value }))}
                        >
                            <option>Aadhaar</option>
                            <option>PAN</option>
                            <option>Passport</option>
                            <option>Driver License</option>
                        </select>
                    </div>

                    <div className="ui-surface p-4 lg:col-span-2">
                        <p className="text-xs text-slate-400 font-semibold">ID Number</p>
                        <input
                            className="ui-input mt-2"
                            value={kyc.idNumber}
                            onChange={(e) => setKyc(k => ({ ...k, idNumber: e.target.value }))}
                            placeholder="Enter your ID number"
                        />
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button type="button" className="ui-button-ghost" onClick={() => toast('Upload UI only (no backend yet)')}>
                                <RiUploadCloud2Line /> Upload documents
                            </button>
                            <button type="button" className="ui-button-primary" onClick={submitKyc}>
                                Submit KYC
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Note: This is UI like Groww. Real KYC storage/verification needs backend + file upload.
                        </p>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="ui-panel">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                        <RiShieldKeyholeLine className="text-white" />
                    </div>
                    <div>
                        <p className="ui-section-title">Security</p>
                        <p className="ui-section-subtitle mt-0.5">Password and account safety</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="ui-surface p-4">
                        <p className="text-xs text-slate-400 font-semibold">Change password</p>
                        <div className="space-y-3 mt-3">
                            <input
                                className="ui-input"
                                placeholder="Current password"
                                type="password"
                                value={security.currentPassword}
                                onChange={(e) => setSecurity(s => ({ ...s, currentPassword: e.target.value }))}
                            />
                            <input
                                className="ui-input"
                                placeholder="New password"
                                type="password"
                                value={security.newPassword}
                                onChange={(e) => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                            />
                            <input
                                className="ui-input"
                                placeholder="Confirm new password"
                                type="password"
                                value={security.confirmNewPassword}
                                onChange={(e) => setSecurity(s => ({ ...s, confirmNewPassword: e.target.value }))}
                            />
                            <button type="button" className="ui-button-primary w-full" onClick={changePassword}>
                                Update password
                            </button>
                        </div>
                    </div>

                    <div className="ui-surface p-4 lg:col-span-2">
                        <p className="text-xs text-slate-400 font-semibold">Login sessions</p>
                        <p className="text-xs text-slate-500 mt-1">This is a mock list for UI. Backend session management not added yet.</p>
                        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                            <table className="ui-table">
                                <thead className="bg-white/3">
                                    <tr>
                                        <th className="px-4">Device</th>
                                        <th className="px-4">Location</th>
                                        <th className="px-4">Last active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4">Chrome · Windows</td>
                                        <td className="px-4">Localhost</td>
                                        <td className="px-4">Just now</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4">WebView · Android</td>
                                        <td className="px-4">—</td>
                                        <td className="px-4">—</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="ui-panel">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                        <RiNotification3Line className="text-white" />
                    </div>
                    <div>
                        <p className="ui-section-title">Preferences</p>
                        <p className="ui-section-subtitle mt-0.5">Alerts and UI preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Toggle checked={prefs.emailAlerts} onChange={(v) => setPrefs(p => ({ ...p, emailAlerts: v }))} label="Email alerts for major events" />
                    <Toggle checked={prefs.priceAlerts} onChange={(v) => setPrefs(p => ({ ...p, priceAlerts: v }))} label="Price movement alerts" />
                    <Toggle checked={isDark} onChange={() => toggleTheme()} label="Dark mode" />
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
                    Theme preference is saved in your browser. Other preferences will be synced when backend is connected.
                </p>
            </div>
        </motion.div>
    );
}

