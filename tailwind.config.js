/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          navy:         '#050A14',
          cyan:         '#00e5ff',
          silver:       '#94a3b8',
          dark:         '#04080f',
          surface:      'rgba(26, 28, 35, 0.6)',
          surfaceLighter: 'rgba(40, 42, 52, 0.8)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%':   { boxShadow: '0 0 10px 0px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px 5px rgba(0, 229, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
