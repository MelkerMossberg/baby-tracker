/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-main': '#0f0d16ff',
        'bg-soft': '#0f0d16ff',
        'card-main': '#161020',
        'accent-pink': '#F6C2D9',
        'accent-peach': '#FFD1B9',
        'accent-mauve': '#B8A4FF',
        'baby-blue': '#B8D4F8',
        'text-main': '#F2F2F2',
        'text-muted': '#A9A6B5',
        'border-subtle': '#0f0d16ff',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'glow-soft': '0 0 12px rgba(255, 241, 247, 0.1)',
        'glow-pink': '0 0 16px rgba(246, 194, 217, 0.15)',
        'glow-peach': '0 0 16px rgba(255, 209, 185, 0.15)',
        'glow-mauve': '0 0 16px rgba(184, 164, 255, 0.15)',
        'glow-blue': '0 0 16px rgba(184, 212, 248, 0.15)',
        'glow-subtle': '0 0 8px rgba(255, 241, 247, 0.08)',
      },
    },
  },
  plugins: [],
}