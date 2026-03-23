import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiRobot2Line, RiLoader4Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        displayName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Password and Confirm password do not match');
            return;
        }
        setLoading(true);
        try {
            await register({
                username: form.username,
                email: form.email,
                password: form.password,
                displayName: form.displayName || form.username,
            });
            toast.success('Account created! $100,000 virtual cash credited 🎉');
            navigate('/app/dashboard');
        } catch (err) {
            const data = err.response?.data;
            const msg = typeof data?.message === 'string' ? data.message : (typeof data === 'string' ? data : null);
            if (msg) {
                toast.error(msg);
            } else if (err.response) {
                toast.error(`Registration failed (${err.response.status})`);
            } else {
                toast.error('Cannot reach server. Is the backend running at http://localhost:8080?');
            }
            console.error('Registration error:', err.response?.data ?? err.message, err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-bg">
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,201,255,0.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,201,255,0.8) 1px, transparent 1px)
                    `,
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Orbs (different from login) */}
            <div
                className="absolute w-[360px] h-[360px] rounded-full blur-[110px] pointer-events-none animate-float-slow"
                style={{
                    top: '8%',
                    right: '10%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute w-[260px] h-[260px] rounded-full blur-[95px] pointer-events-none animate-gradient-shift"
                style={{
                    bottom: '10%',
                    left: '12%',
                    background: 'radial-gradient(circle, rgba(0,201,255,0.32) 0%, transparent 70%)',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="login-card p-8 sm:p-10 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-2 ring-white/10 shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #0073e6 50%, #00c9ff 100%)',
                            boxShadow: '0 8px 32px rgba(168,85,247,0.22), 0 0 0 1px rgba(255,255,255,0.1)',
                        }}
                    >
                        <RiRobot2Line className="text-white text-3xl" aria-hidden />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Create your account
                    </h1>
                    <p className="text-slate-400 text-sm mt-1.5">
                        Get $100,000 virtual cash to start trading
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="ui-label" htmlFor="reg-name">Name</label>
                        <input
                            id="reg-name"
                            name="displayName"
                            type="text"
                            value={form.displayName}
                            onChange={handleChange}
                            placeholder="Your display name"
                            className="ui-input"
                        />
                    </div>

                    <div>
                        <label className="ui-label" htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="ui-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="ui-label" htmlFor="reg-username">Username</label>
                        <input
                            id="reg-username"
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Min 3 characters"
                            className="ui-input"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="ui-label" htmlFor="reg-password">Password</label>
                        <div className="relative">
                            <input
                                id="reg-password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                className="ui-input pr-12"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                            >
                                {showPw ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="ui-label" htmlFor="reg-confirm">Confirm password</label>
                        <div className="relative">
                            <input
                                id="reg-confirm"
                                name="confirmPassword"
                                type={showConfirmPw ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className="ui-input pr-12"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPw ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="ui-button-primary w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading && <RiLoader4Line className="text-xl animate-spin" aria-hidden />}
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
