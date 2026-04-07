import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dnd-dark': '#0f0f1a',
        'dnd-surface': '#1a1a2e',
        'dnd-card': '#16213e',
        'dnd-border': '#2a2a4a',
        'dnd-gold': '#c49a3c',
        'dnd-gold-light': '#e8b84b',
        'dnd-red': '#8b1a1a',
        'dnd-text': '#e8e0d0',
        'dnd-muted': '#9090a0',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
