/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)'],
        geist: ['var(--font-geist)'],
        'lexend': ['var(--font-lexend)'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        marker: {
          blue: {
            bg: '#F3F8FF',
            text: '#084DCB',
            
          }
        },
        pinkbrand: '#8727c2',
      },
    },
  },
  plugins: [],
}; 