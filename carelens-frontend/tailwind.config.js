/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14202E',
          900: '#0D1826',
          800: '#16283C',
          700: '#22394F',
        },
        slate: {
          muted: '#5A6A75',
          line: '#DDE4E8',
          soft: '#F6F8F9',
        },
        verified: {
          DEFAULT: '#0E7A63',
          soft: '#E6F2EF',
          line: '#BEDCD4',
        },
        review: {
          DEFAULT: '#9A6209',
          soft: '#FDF4E4',
          line: '#EBD5AC',
        },
        alert: {
          DEFAULT: '#A5251C',
          soft: '#FBECEA',
          line: '#EFC8C4',
        },
        accent: {
          DEFAULT: '#0E5A6B',
          soft: '#E7F1F3',
          line: '#BFD9DE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 32, 46, 0.04), 0 1px 3px rgba(20, 32, 46, 0.06)',
        lift: '0 4px 12px rgba(20, 32, 46, 0.08)',
        panel: '0 16px 48px rgba(13, 24, 38, 0.18)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: '0.25' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 180ms ease-out both',
        blink: 'blink 1.2s infinite',
      },
    },
  },
  plugins: [],
};
