/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        paper: '#F7F8FA',
        brand: {
          50: '#EEF4F3',
          100: '#D7E5E2',
          300: '#8FB8B0',
          500: '#2F6E62',
          600: '#255950',
          700: '#1C443D',
          900: '#102520',
        },
        amberflag: '#C77B3B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
