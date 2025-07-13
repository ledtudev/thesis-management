/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-secondary': '#1e1e1e',
        'dark-tertiary': '#252525',
        'stroke-dark': '#2d2d2d',
      },
    },
  },
  plugins: [],
};
