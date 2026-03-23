/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neural: {
          950: '#020617',
          900: '#0a0f1e',
          800: '#0d1526',
          700: '#111b33',
          600: '#1a2744',
        },
        neon: {
          green:  '#00ff88',
          blue:   '#00c9ff',
          purple: '#a855f7',
          red:    '#ff4d6d',
          gold:   '#fbbf24',
          cyan:   '#22d3ee',
          pink:   '#f472b6',
        },
        gain:  '#00ff88',
        loss:  '#ff4d6d',
        surface: {
          light: '#ffffff',
          'light-2': '#f8fafc',
          'light-3': '#f1f5f9',
          'light-4': '#e2e8f0',
          dark: '#0d1526',
          'dark-2': '#111b33',
          'dark-3': '#1a2744',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'neural-grid': `linear-gradient(rgba(0,201,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,201,255,0.03) 1px, transparent 1px)`,
        'gain-glow':  'linear-gradient(135deg, #00ff8822, #00ff8800)',
        'loss-glow':  'linear-gradient(135deg, #ff4d6d22, #ff4d6d00)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(200,100%,74%,0.08) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(278,68%,77%,0.08) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(160,100%,45%,0.04) 0, transparent 50%)',
        'light-mesh': 'radial-gradient(at 40% 20%, hsla(200,100%,74%,0.12) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(278,68%,77%,0.10) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(160,100%,45%,0.06) 0, transparent 50%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'neon-green':  '0 0 20px rgba(0,255,136,0.3)',
        'neon-blue':   '0 0 20px rgba(0,201,255,0.3)',
        'neon-red':    '0 0 20px rgba(255,77,109,0.3)',
        'neon-purple': '0 0 20px rgba(168,85,247,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.5)',
        'soft':        '0 2px 12px rgba(0,0,0,0.06)',
        'soft-md':     '0 4px 20px rgba(0,0,0,0.08)',
        'soft-lg':     '0 8px 30px rgba(0,0,0,0.10)',
        'inner-glow':  'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        'light-card':  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'light-card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-slow':      'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'ticker':          'ticker 30s linear infinite',
        'float':           'float 6s ease-in-out infinite',
        'float-slow':      'float 8s ease-in-out infinite',
        'float-delayed':   'float 6s ease-in-out 2s infinite',
        'flash-green':     'flashGreen 0.4s ease-out',
        'flash-red':       'flashRed 0.4s ease-out',
        'glow-pulse':      'glowPulse 2s ease-in-out infinite',
        'gradient-shift':  'gradientShift 6s ease infinite',
        'shimmer':         'shimmer 2.5s ease-in-out infinite',
        'fade-in-up':      'fadeInUp 0.5s ease-out forwards',
        'slide-in-right':  'slideInRight 0.4s ease-out',
        'slide-in-left':   'slideInLeft 0.4s ease-out',
        'slide-in-down':   'slideInDown 0.3s ease-out',
        'scale-in':        'scaleIn 0.3s ease-out',
        'bounce-in':       'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'spin-slow':       'spin 3s linear infinite',
        'ping-slow':       'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'morph':           'morph 8s ease-in-out infinite',
        'border-flow':     'borderFlow 4s linear infinite',
        'text-gradient':   'textGradient 4s linear infinite',
        'ripple':          'ripple 1s ease-out',
        'skeleton':        'skeleton 1.8s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        flashGreen: {
          '0%':   { backgroundColor: 'rgba(0,255,136,0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%':   { backgroundColor: 'rgba(255,77,109,0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        glowPulse: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.6 },
        },
        gradientShift: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.8' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '50%':  { opacity: '1', transform: 'scale(1.05)' },
          '70%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        morph: {
          '0%,100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':     { borderRadius: '30% 60% 70% 40% / 60% 40% 30% 70%' },
        },
        borderFlow: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        textGradient: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0'   },
        },
        skeleton: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
