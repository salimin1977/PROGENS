/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050b16',
          900: '#0a1628',
          850: '#0d1c33',
          800: '#11233d',
          700: '#182f4d',
          600: '#223e63',
          500: '#2f527f',
        },
        teal: {
          50: '#eefbfa',
          100: '#d4f4f1',
          200: '#a9e9e3',
          300: '#74d8cf',
          400: '#3fc0b4',
          500: '#22a89b',
          600: '#17877e',
          700: '#166b66',
          800: '#155552',
          900: '#134745',
        },
        gold: {
          50: '#fdf9ec',
          100: '#faf0cb',
          200: '#f4dd97',
          300: '#edc55c',
          400: '#e6ad33',
          500: '#d6931f',
          600: '#b67117',
          700: '#925317',
          800: '#794319',
          900: '#67381a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(10, 22, 40, 0.06), 0 1px 3px 0 rgba(10, 22, 40, 0.08)',
        elevated: '0 4px 16px -4px rgba(10, 22, 40, 0.12), 0 2px 6px -2px rgba(10, 22, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
