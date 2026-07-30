/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: '#05070f',
          card: 'rgba(15, 23, 42, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#3b82f6',
          accentLight: '#60a5fa',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-premium': 'radial-gradient(circle at 50% 50%, #0c1530 0%, #030712 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
