/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#ed1b24',
        dark: 'rgb(35, 31, 32)',
      },
    },
  },
  plugins: [],
};


