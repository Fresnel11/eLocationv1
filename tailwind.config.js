/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'rgb(229 231 235)',
        background: 'rgb(255 255 255)',
        foreground: 'rgb(15 23 42)',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          amber: '#f59e0b',
          orange: '#ea580c',
          emerald: '#10b981',
          teal: '#0d9488',
          indigo: '#6366f1',
          violet: '#8b5cf6',
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(37, 99, 235, 0.25)',
        'glow-md': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'glow-lg': '0 0 35px -5px rgba(37, 99, 235, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card-hover': '0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 0 15px -3px rgba(37, 99, 235, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};