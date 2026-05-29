import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        parch:        '#e9dcbd',
        'parch-hi':   '#f3e9d2',
        'parch-lo':   '#d2bd91',
        'parch-edge': '#b39a68',
        ink:          '#2c2316',
        'ink-soft':   '#4d3f29',
        'ink-faint':  '#7a6748',
        gold:         '#8a6a2c',
        'gold-bright':'#c4a04a',
        'gold-pale':  '#e3c878',
        crimson:      '#6a1d15',
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        decoro:  ['"Cinzel Decorative"', '"Cinzel"', 'serif'],
        serif:   ['"EB Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
