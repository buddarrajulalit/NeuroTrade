import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiRobot2Line, RiLoader4Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ username: form.username, password: form.password });
            toast.success('Welcome back!');
            navigate('/app/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-bg">
            {/* Grid overlay – NeuroTrade style */}
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

            {/* Animated gradient orbs – different positions/sizes for your app */}
            <div
                className="absolute w-[320px] h-[320px] rounded-full blur-[100px] pointer-events-none animate-gradient-shift"
                style={{
                    top: '10%',
                    left: '15%',
                    background: 'radial-gradient(circle, rgba(0,201,255,0.35) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute w-[280px] h-[280px] rounded-full blur-[90px] pointer-events-none animate-float-slow"
                style={{
                    bottom: '15%',
                    right: '10%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none animate-float"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
                }}
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="login-card p-8 sm:p-10 relative z-10">
                {/* Logo / brand – distinct for NeuroTrade */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-2 ring-white/10 shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #00c9ff 0%, #0073e6 50%, #a855f7 100%)',
                            boxShadow: '0 8px 32px rgba(0,201,255,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
                        }}
                    >
                        <RiRobot2Line className="text-white text-3xl" aria-hidden />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-slate-400 text-sm mt-1.5">
                        Sign in to your NeuroTrade account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="login-username" className="ui-label">Username</label>
                        <input
                            id="login-username"
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            autoComplete="username"
                            className="ui-input pr-4"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="login-password" className="ui-label">Password</label>
                        <div className="relative">
                            <input
                                id="login-password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="ui-input pr-12"
                                required
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

                    <button type="submit" disabled={loading} className="ui-button-primary w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading && <RiLoader4Line className="text-xl animate-spin" aria-hidden />}
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="login-link">
                        Create one
                    </Link>
                </p>

                <div className="border-t border-white/5 mt-6 pt-5">
                    <Link
                        to="/market"
                        className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
                    >
                        Continue as Guest → View Market
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
