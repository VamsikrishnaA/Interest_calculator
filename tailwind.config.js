/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700", // gold tone
        secondary: "#222831", // dark background
        accent: "#00ADB5", // teal-blue accent
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
  darkMode: 'class',
}
