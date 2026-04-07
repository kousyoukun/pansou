/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-card': 'rgba(255,255,255,0.03)',
        'bg-card-hover': 'rgba(255,255,255,0.06)',
        'text-primary': '#f0ece4',
        'text-secondary': '#8a8690',
        'text-muted': '#5a5660',
        'accent': '#e8a849',
        'accent-glow': 'rgba(232,168,73,0.15)',
        'accent-soft': 'rgba(232,168,73,0.08)',
        'border': 'rgba(255,255,255,0.06)',
        'border-focus': 'rgba(232,168,73,0.4)',
      },
      borderRadius: {
        'radius': '16px',
        'radius-sm': '10px',
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['Noto Sans SC', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}