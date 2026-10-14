/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-base': '#07090E',
        'dark-surface': '#0F131C',
        'dark-card': '#151A26',
        volt: {
          DEFAULT: '#CCFF00',
          hover: '#B8E600',
          glow: 'rgba(204, 255, 0, 0.25)',
          contrast: '#07090E'
        },
        'dark-border': 'rgba(255, 255, 255, 0.08)'
      },
      animation: {
        'gradient-x': 'gradient-x 4s ease infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
