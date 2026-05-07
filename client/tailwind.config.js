/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: colors.orange,
        purple: colors.amber,
        'electric-orange': '#FF5722',
        'primary': {
          DEFAULT: '#FF5722',
          dark: '#E64A19',
          light: '#FF8A65',
        }
      }
    },
  },
  plugins: [],
}