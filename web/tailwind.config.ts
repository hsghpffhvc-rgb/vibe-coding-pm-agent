import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090B',
          900: '#0C0C10',
          800: '#121218',
          700: '#1A1A22',
        },
        brand: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        accent: {
          400: '#22D3EE',
        },
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0, 0, 0, 0.4)',
        glow: '0 0 0 1px rgba(139, 92, 246, 0.35), 0 8px 30px rgba(139, 92, 246, 0.18)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        rise: 'rise 0.28s ease-out both',
        breathe: 'breathe 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
