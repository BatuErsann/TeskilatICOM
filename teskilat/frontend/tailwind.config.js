/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#231f20', // Pantone Black C
        secondary: '#2d2a2b', // Lighter variant of Pantone Black C
        accent: '#ffcd00', // Pantone 116 C (Yellow)
        'accent-purple': '#ffcd00', // Same as accent to unify the theme
      },
      fontFamily: {
        sans: ['Gilroy', 'sans-serif'],
        display: ['Gilroy', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(to right bottom, rgba(35, 31, 32, 0.9), rgba(35, 31, 32, 0.95)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
      }
    },
  },
  plugins: [],
}
