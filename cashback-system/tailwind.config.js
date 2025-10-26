/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f8f5',
          100: '#d1f2eb',
          200: '#a3e4d7',
          300: '#76d7c4',
          400: '#48c9b0',
          500: '#17A589', // Verde turquesa principal da logo
          600: '#138d75',
          700: '#117864',
          800: '#0e6251',
          900: '#0b5345',
        },
        secondary: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#FFA726', // Laranja da logo (cifrão)
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        accent: {
          50: '#eceff1',
          100: '#cfd8dc',
          200: '#b0bec5',
          300: '#90a4ae',
          400: '#78909c',
          500: '#607d8b',
          600: '#546e7a',
          700: '#455a64',
          800: '#37474f',
          900: '#263238',
        },
      },
    },
  },
  plugins: [],
}
