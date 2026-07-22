/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          900: '#0a192f',
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
};
