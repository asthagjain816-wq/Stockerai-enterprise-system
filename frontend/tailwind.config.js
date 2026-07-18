/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          505: '#78889b',
          500: '#64748b',
          600: '#3F4C68', // disabled / text muted
          700: '#2B354C', // border dark secondary
          800: '#1C2336', // border dark base
          850: '#151B2A', // widget inner/timeline containers
          900: '#101420', // cards/nav background
          950: '#0A0D14', // dashboard body background
          955: '#0A0D14', // matching custom deep background
        },
      },
    },
  },
  plugins: [],
}