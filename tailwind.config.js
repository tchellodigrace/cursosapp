/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          400: '#6b97ff',
          500: '#3d6ef5',
          600: '#2451d6',
          700: '#1a3aab',
          800: '#152d82',
          900: '#0f1f5c',
        },
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#22222f',
          500: '#2d2d3d',
        }
      },
    },
  },
  plugins: [],
}
