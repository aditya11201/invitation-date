/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#f6f2ed',
          100: '#f0e7e2',
          200: '#e3c9c4',
          300: '#d69a99',
          400: '#bb6c71',
          500: '#a34e5d',
          600: '#873f50',
          700: '#6e3547',
          800: '#542b3a',
          900: '#3b202c',
        },
        lavender: {
          50: '#f8f5f8',
          100: '#eee7f0',
          200: '#ded1e3',
          300: '#c9b7d2',
          400: '#a58aac',
          500: '#876d91',
          600: '#6e5878',
          700: '#554662',
        },
        ivory: {
          50: '#fefefe',
          100: '#fcfbf7',
          200: '#f7f4ea',
          300: '#ede8d5',
          400: '#ded5b8',
        },
        paper: '#FDFBF7',
        ink: '#2A1B18',
        burgundy: {
          50: '#FDF2F4',
          100: '#FCE4E8',
          200: '#F8C9D2',
          400: '#E27385',
          600: '#B83A4B',
          800: '#7A2030',
          900: '#4D121D',
        },
        gold: {
          300: '#F3E5AB',
          500: '#D4A373',
          600: '#B8824A',
        },
      },
      fontFamily: {
        handwriting: ['"Dancing Script"', '"Caveat"', 'cursive'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        handwritingPaper: ['"Caveat"', 'cursive'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-16px) scale(1.02)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(236,72,153,0.7))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        heartPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite linear',
        heartPop: 'heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      boxShadow: {
        'glass': '0 18px 50px -24px rgba(82, 44, 50, 0.34), inset 0 1px 1px 0 rgba(255, 255, 255, 0.84)',
        'glass-hover': '0 24px 60px -24px rgba(82, 44, 50, 0.42), inset 0 1px 2px 0 rgba(255, 255, 255, 0.92)',
        'paper': '0 18px 38px -14px rgba(96, 52, 57, 0.28), 0 3px 0 rgba(255, 255, 255, 0.7) inset',
        'glow-pink': '0 0 32px -12px rgba(163, 78, 93, 0.7)',
        'glow-lavender': '0 0 32px -12px rgba(135, 109, 145, 0.62)',
        'ticket': '0 24px 50px -16px rgba(96, 52, 57, 0.3), 0 0 25px 0 rgba(255, 255, 255, 0.7) inset',
      }
    },
  },
  plugins: [],
}
