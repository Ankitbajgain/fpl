/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 45px -26px rgba(28, 43, 57, 0.45)',
      },
      colors: {
        ink: '#19222d',
        mist: '#f6f4ef',
        leaf: '#0b6b57',
        clay: '#ef8456',
      },
    },
  },
  plugins: [],
}

