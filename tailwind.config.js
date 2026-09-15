/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        curtain: {
          DEFAULT: '#C4234B',
          dark: '#8F1836',
        },
        ink: '#211A1D',
        paper: '#FFF7EF',
        marquee: '#E8B23D',
        bubblegum: '#FF8FB1',
        mint: '#7FD9C4',
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
