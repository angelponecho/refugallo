import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#141414',
          elevated: '#1E1E1E',
        },
        brand: {
          DEFAULT: '#0094C6',
          hover: '#00B4F0',
        },
        'text-muted': '#A3A3A3',
        'border-dark': '#2A2A2A',
      },
      fontFamily: {
        headline: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.2) 70%, transparent 100%)',
        'hero-gradient-mobile': 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
