/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          main: '#FAF8F4',
          secondary: '#F2E9DC',
          card: '#FBF7F0',
          warm: '#F7F2EA',
          border: '#E6DBC9',
        },
        gold: {
          primary: '#B88A4A',
          secondary: '#C89B5C',
          soft: '#D8B982',
        },
        espresso: {
          deep: '#2E1F18',
          main: '#34241D',
          warm: '#3C2B20',
          muted: '#695B4E',
        },
        accent: {
          olive: '#6B705C',
          terracotta: '#9E5A47',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
