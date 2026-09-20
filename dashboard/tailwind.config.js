/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f7f3',
          100: '#ceefe7',
          200: '#9de0d0',
          300: '#6cd0b8',
          400: '#3bc1a1',
          500: '#0F9D83',
          600: '#0d8a73',
          700: '#0a6c5a',
          800: '#074f42',
          900: '#043129',
        },
      },
    },
  },
  plugins: [],
};
