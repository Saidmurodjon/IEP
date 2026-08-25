/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Akademik navy — bosiq, to'yinganligi past (universitet/akademiya uslubi)
        primary: {
          50: '#f4f7fa',
          100: '#e6edf5',
          200: '#c7d8e8',
          300: '#9bb8d4',
          400: '#6892b8',
          500: '#43719c',
          600: '#325882',
          700: '#28466a',
          800: '#1f3855',
          900: '#1a3a5f',
          950: '#12283f',
        },
        // Issiq oltin akzent
        accent: {
          50: '#fdf9ef',
          100: '#f9efd6',
          200: '#f2dda9',
          300: '#e8c476',
          400: '#d9a94f',
          500: '#c8973f',
          600: '#ab7a30',
          700: '#8a5f2a',
          800: '#714e28',
          900: '#5f4224',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
