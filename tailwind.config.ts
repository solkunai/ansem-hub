import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        panel: '#0a0a0a',
        'panel-alt': '#080908',
        raised: '#0b0d0b',
        line: {
          DEFAULT: '#1c211c',
          subtle: '#14171466',
          accent: '#244a28',
        },
        green: {
          DEFAULT: '#4FE05D',
          deep: '#2f7a38',
        },
        red: {
          DEFAULT: '#FF4438',
        },
        cyan: {
          DEFAULT: '#38BDF8',
        },
        ink: {
          primary: '#F2F4F0',
          secondary: '#E4E7E2',
          muted: '#D3D6D1',
          faint: '#5a615a',
        },
      },
      fontFamily: {
        display: ['"Saira Condensed"', 'system-ui', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        cell: '12px',
        pill: '24px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.015)' },
        },
      },
      animation: {
        blink: 'blink 1.5s ease-in-out infinite',
        ticker: 'ticker 26s linear infinite',
        breathe: 'breathe 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
