// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde7ff',
          200: '#b8ccff',
          400: '#6b96f5',
          500: '#3b6ef4',   // primary CTA — buttons, links
          600: '#2451d6',
          800: '#1a3696',
          900: '#0f2060',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fb',   // page background
          100: '#f1f3f7',   // card background
          200: '#e4e7ef',   // borders
          300: '#cbd0dc',   // disabled
          600: '#6b7280',   // muted text
          900: '#111827',   // primary text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem',  { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['2.5rem',  { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['1.875rem',{ lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '600' }],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.08)',
        'modal':    '0 20px 60px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'skeleton':   'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                     to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        skeleton: { '0%, 100%': { opacity: '1' },               '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
}